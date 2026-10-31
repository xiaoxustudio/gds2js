const FC = preload("res://faces.gd")
const LF = preload("res://literals.gd")
const SL = preload("res://slots.gd")
const WK = preload("res://walk.gd")
const HP = preload("res://helpers.gd")


static func _collect_class_targets(cls, targets):
	for v in cls["vars"]:
		targets.append({"type": v.get("type"), "init": v.get("init"), "loc": v["loc"]})
	for f in cls["funcs"]:
		for p in f["params"]:
			targets.append({"type": p.get("type"), "init": p.get("default"), "loc": f["loc"]})
		targets.append({"type": f.get("returnType"), "init": null, "loc": f["loc"]})
	for inner in cls["innerClasses"]:
		_collect_class_targets(inner, targets)


static func _collect_class_names(c, names):
	names[c["name"]] = true
	for inner in c["innerClasses"]:
		_collect_class_names(inner, names)


static func _src_ann_of(e, locals):
	if e != null and e.get("kind") == "ident":
		return locals.get(e["name"])
	return null


static func _walk_exprs(n, ret_type, targets, locals, typed_vars, fn_params):
	if n is Array:
		for x in n:
			_walk_exprs(x, ret_type, targets, locals, typed_vars, fn_params)
		return
	if not (n is Dictionary):
		return
	if n.get("kind") == "var":
		var t = n.get("type")
		if n.get("name") != null and t != null and not locals.has(n["name"]):
			locals[n["name"]] = t
	if n.get("kind") == "return" and ret_type != null:
		targets.append({"type": ret_type, "init": n.get("value"), "loc": n["loc"]})
	if n.get("kind") == "assign" and ret_type != null:
		var name = WK.assign_target_name(n["target"])
		var decl = null
		if name != null:
			decl = typed_vars.get(name)
			if decl == null:
				decl = locals.get(name)
		if decl != null:
			targets.append({"type": decl, "init": n["value"], "loc": n["loc"], "srcAnn": _src_ann_of(n["value"], locals), "assignStmt": true})
	if n.get("kind") == "call" and n.get("args") is Array:
		var callee = n["callee"]
		if callee.get("kind") == "ident" and callee.get("name") != null and fn_params.has(callee["name"]):
			var pt = fn_params[callee["name"]]
			var args = n["args"]
			var limit = args.size() if args.size() < pt.size() else pt.size()
			for i in limit:
				var arg0 = args[i]
				var arg_ann = null
				if arg0 != null and arg0.get("kind") == "ident":
					arg_ann = locals.get(arg0["name"])
				targets.append({"type": pt[i], "init": arg0, "loc": args[i]["loc"], "srcAnn": arg_ann, "fnName": callee["name"], "fnPos": i + 1})
	for k in n.keys():
		if k != "loc":
			_walk_exprs(n[k], ret_type, targets, locals, typed_vars, fn_params)


static func _walk_stmts(stmts, ret_type, targets, locals, typed_vars, fn_params):
	if ret_type == null:
		locals.clear()
	for s in stmts:
		var kind = s.get("kind")
		if kind == "var":
			var src_ann = null
			if s.get("init") != null and s["init"].get("kind") == "ident":
				src_ann = locals.get(s["init"]["name"])
			targets.append({"type": s.get("type"), "init": s.get("init"), "loc": s["loc"], "varName": s["name"], "srcAnn": src_ann})
			if s.get("name") != null and s.get("type") != null and not locals.has(s["name"]):
				locals[s["name"]] = s["type"]
		elif kind == "if":
			for b in s["branches"]:
				_walk_stmts(b["body"], ret_type, targets, locals, typed_vars, fn_params)
		elif kind == "for" or kind == "while":
			_walk_stmts(s["body"], ret_type, targets, locals, typed_vars, fn_params)
		elif kind == "return" and ret_type != null:
			targets.append({"type": ret_type, "init": s.get("value"), "loc": s["loc"]})
		elif kind == "assign" and WK.assign_target_name(s["target"]) != null:
			var name = WK.assign_target_name(s["target"])
			var decl = typed_vars.get(name)
			if decl == null:
				decl = locals.get(name)
			if decl != null:
				targets.append({"type": decl, "init": s["value"], "loc": s["loc"], "srcAnn": _src_ann_of(s["value"], locals), "assignStmt": true})
		else:
			_walk_exprs(s, ret_type, targets, locals, typed_vars, fn_params)


static func check_typed_collections(m, diags):
	var targets = []
	for v in m["vars"]:
		targets.append({"type": v.get("type"), "init": v.get("init"), "loc": v["loc"]})
	for f in m["funcs"]:
		for p in f["params"]:
			targets.append({"type": p.get("type"), "init": p.get("default"), "loc": f["loc"]})
		targets.append({"type": f.get("returnType"), "init": null, "loc": f["loc"]})
	for c in m["innerClasses"]:
		_collect_class_targets(c, targets)
	var class_names = {}
	for c in m["innerClasses"]:
		_collect_class_names(c, class_names)
	var typed_vars = {}
	for v in m["vars"]:
		if v.get("type") != null:
			typed_vars[v["name"]] = v["type"]
	var fn_params = {}
	for f in m["funcs"]:
		var list = []
		for p in f["params"]:
			list.append(p.get("type"))
		fn_params[f["name"]] = list
	var locals = {}
	for f in m["funcs"]:
		_walk_stmts(f["body"], f.get("returnType"), targets, locals, typed_vars, fn_params)
	_collect_class_bodies(m["innerClasses"], targets, locals, typed_vars, fn_params)
	for t in targets:
		_check_target(t, diags, class_names, m)


static func _collect_class_bodies(list, targets, locals, typed_vars, fn_params):
	for c in list:
		for f in c["funcs"]:
			_walk_stmts(f["body"], f.get("returnType"), targets, locals, typed_vars, fn_params)
		_collect_class_bodies(c["innerClasses"], targets, locals, typed_vars, fn_params)


static func _named_name(t):
	if t == null or t.get("kind") != "named":
		return null
	return t["name"]


static func _check_target(t, diags, class_names, m):
	var slot_ann = _named_name(t.get("type"))
	if t.get("fnName") != null and t.get("fnPos") != null and slot_ann != null and t.get("srcAnn") != null:
		var src_ann = t["srcAnn"]
		if src_ann.get("kind") == "named" and (src_ann["name"].begins_with("Array[") or src_ann["name"].begins_with("Dictionary[")) and (slot_ann.begins_with("Array[") or slot_ann.begins_with("Dictionary[")) and src_ann["name"] != slot_ann:
			diags.append({"code": "typed-collection-param", "message": "Invalid argument for \"" + t["fnName"] + "()\" function: argument " + str(t["fnPos"]) + " should be \"" + slot_ann + "\" but is \"" + src_ann["name"] + "\".", "loc": t["loc"]})
			return
	var target_ann = _named_name(t.get("type"))
	if t.get("assignStmt") == true and target_ann != null and SL.is_coll_text(target_ann) and t.get("srcAnn") != null:
		var sa = t["srcAnn"]
		if sa.get("kind") == "named" and SL.is_coll_text(sa["name"]) and sa["name"] != target_ann:
			diags.append({"code": "typed-collection-assign-value", "message": "Value of type \"" + sa["name"] + "\" cannot be assigned to a variable of type \"" + target_ann + "\".", "loc": t["loc"]})
			return
	if t.get("varName") != null and target_ann != null and SL.is_coll_text(target_ann) and t.get("init") != null:
		var init = t["init"]
		var src_kind = null
		if init.get("kind") == "array":
			src_kind = "Array"
		elif init.get("kind") == "dict":
			src_kind = "Dictionary"
		var want_kind = "Array" if target_ann.begins_with("Array") else "Dictionary"
		if src_kind != null and src_kind != want_kind:
			diags.append({"code": "typed-collection-assign", "message": "Cannot assign a value of type " + LF.literal_face_text(init, src_kind) + " to variable \"" + t["varName"] + "\" with specified type " + target_ann + ".", "loc": t["loc"]})
			return
		var st = null
		if src_kind == null:
			st = SL.slot_source(init)
		if st != null and SL.scalar_source_name(st, class_names):
			diags.append({"code": "typed-collection-assign-as", "message": "Cannot assign a value of type \"" + st + "\" as \"" + target_ann + "\".", "loc": t["loc"]})
			diags.append({"code": "typed-collection-assign", "message": "Cannot assign a value of type " + st + " to variable \"" + t["varName"] + "\" with specified type " + target_ann + ".", "loc": t["loc"]})
			return
	if t.get("assignStmt") == true and target_ann != null and SL.is_coll_text(target_ann) and t.get("srcAnn") != null:
		var sa2 = t["srcAnn"]
		if sa2.get("kind") == "named" and SL.scalar_source_name(sa2["name"], class_names):
			diags.append({"code": "typed-collection-assign-value", "message": "Value of type \"" + sa2["name"] + "\" cannot be assigned to a variable of type \"" + target_ann + "\".", "loc": t["loc"]})
			return
	if t.get("type") == null or t["type"].get("kind") != "named":
		return
	var name = t["type"]["name"]
	var base = ""
	if name.begins_with("Array["):
		base = "Array"
	elif name.begins_with("Dictionary["):
		base = "Dictionary"
	else:
		return
	if not name.ends_with("]"):
		return
	var inner = name.substr(base.length() + 1, name.length() - base.length() - 2)
	if inner.contains("["):
		diags.append({"code": "typed-collection-nested", "message": "Nested typed collections are not supported.", "loc": t["loc"]})
		return
	if t.get("init") == null:
		return
	var parent_of = {}
	for c in m["innerClasses"]:
		_collect_parents(c, parent_of)
	if base == "Array":
		var kind = inner.strip_edges()
		if t["init"].get("kind") == "array":
			for it in t["init"]["items"]:
				var st2 = _slot_of(it, class_names)
				if st2 == null or _holds(kind, st2, class_names, parent_of):
					continue
				_report(diags, t["loc"], st2, kind, class_names, "Cannot have an element of type \"" + st2 + "\" in an array of type \"Array[" + kind + "]\".", true, kind)
				break
	else:
		var parts = []
		for p in inner.split(","):
			parts.append(p.strip_edges())
		if parts.size() != 2:
			return
		var key_kind = parts[0]
		var val_kind = parts[1]
		if t["init"].get("kind") == "dict":
			var text = "Dictionary[" + key_kind + ", " + val_kind + "]"
			for en in t["init"]["entries"]:
				var ks = _slot_of(en["key"], class_names)
				if ks != null and not _holds(key_kind, ks, class_names, parent_of):
					_report(diags, t["loc"], ks, key_kind, class_names, "Cannot have a key of type \"" + ks + "\" in a dictionary of type \"" + text + "\".", false, key_kind)
					break
				var vs = _slot_of(en["value"], class_names)
				if vs != null and not _holds(val_kind, vs, class_names, parent_of):
					_report(diags, t["loc"], vs, val_kind, class_names, "Cannot have a value of type \"" + vs + "\" in a dictionary of type \"" + text + "\".", false, val_kind)
					break


static func _slot_of(e, class_names):
	if e.get("kind") == "call" and e["callee"].get("kind") == "attribute" and e["callee"].get("name") == "new" and e["callee"]["obj"].get("kind") == "ident" and class_names.has(e["callee"]["obj"]["name"]):
		return e["callee"]["obj"]["name"]
	return SL.slot_source(e)


static func _collect_parents(c, parent_of):
	var ext = c.get("extends")
	if ext != null and ext != "":
		parent_of[c["name"]] = ext
	for inner in c["innerClasses"]:
		_collect_parents(inner, parent_of)


static func _related(a, b, parent_of):
	var x = a
	var guard = 0
	while x != null and guard < 64:
		if x == b:
			return true
		x = parent_of.get(x)
		guard += 1
	x = b
	guard = 0
	while x != null and guard < 64:
		if x == a:
			return true
		x = parent_of.get(x)
		guard += 1
	return false


static func _native_root(x, class_names, parent_of):
	var cur = x
	for guard in 16:
		if cur == null:
			break
		var p = parent_of.get(cur)
		if p == null:
			return "RefCounted" if class_names.has(cur) else cur
		if not class_names.has(p):
			return p
		cur = p
	return "RefCounted"


static func _is_object_face(x, class_names):
	return class_names.has(x) or HP.NATIVE_CLASS_SLOTS.has(x)


static func _holds(kind, st, class_names, parent_of):
	if st == "null":
		return true
	if HP.NATIVE_CLASS_SLOTS.has(kind):
		if kind == "Object":
			return _is_object_face(st, class_names)
		return _is_object_face(st, class_names) and _native_root(st, class_names, parent_of) == kind
	if class_names.has(kind):
		return class_names.has(st) and _related(kind, st, parent_of)
	return SL.can_hold(kind, st)


static func _report(diags, loc, st, kind, class_names, second, is_array, k):
	if not _is_object_face(kind, class_names) and not _is_object_face(st, class_names):
		diags.append({"code": "typed-collection-literal", "message": "Cannot include a value of type \"" + st + "\" as \"" + kind + "\".", "loc": loc})
	diags.append({"code": "typed-collection-element", "message": second, "loc": loc})
