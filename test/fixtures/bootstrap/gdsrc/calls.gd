const SL = preload("res://slots.gd")
const FC = preload("res://faces.gd")
const WK = preload("res://walk.gd")
const O = preload("res://op_tables.gd")
const AR = preload("res://arity.gd")
const T = preload("res://arity_tables.gd")
const LF = preload("res://literals.gd")
const GLOB = preload("res://globals.gd")


static func check_method_call(name, e, diags):
	if name != "join":
		return
	var recv = null
	if e["callee"].get("kind") == "attribute":
		recv = e["callee"]["obj"]
	if recv != null and not (recv.get("kind") == "lit" and recv.get("lit") == "string"):
		return
	var got = e["args"].size()
	if got == 0:
		diags.append({"code": "join-arity", "message": "Too few arguments for \"join()\" call. Expected at least 1 but received 0.", "loc": e["loc"]})
		return
	if got > 1:
		diags.append({"code": "join-arity", "message": "Too many arguments for \"join()\" call. Expected at most 1 but received " + str(got) + ".", "loc": e["loc"]})
		return
	var arg_kind = FC.literal_type_name(e["args"][0])
	var t = FC.static_type(e["args"][0])
	if arg_kind != null or t == null:
		return
	var msg = O.JOIN_BAD_ARG.get(t)
	if msg != null:
		diags.append({"code": "join-arg", "message": msg, "loc": e["loc"]})


static func check_call(name, e, diags):
	if name != "bool" or e["args"].size() == 0:
		return
	var t = FC.static_type(e["args"][0])
	if t == "Array" or t == "String" or t == "Dictionary":
		diags.append({"code": "bool-ctor-signature", "message": "No constructor of \"bool\" matches the signature \"bool(" + t + ")\".", "loc": e["loc"]})


static func _sa_expr(diags, e, local, instance_vars, instance_funcs, who):
	var kind = e.get("kind")
	if kind == "ident":
		if not local.has(e["name"]) and instance_vars.has(e["name"]):
			diags.append({"code": "static-access-var", "message": "Cannot access non-static variable \"" + e["name"] + "\" from " + who + ".", "loc": e["loc"]})
		return
	if kind == "call":
		if e["callee"].get("kind") == "ident" and not local.has(e["callee"]["name"]) and instance_funcs.has(e["callee"]["name"]):
			diags.append({"code": "static-call-func", "message": "Cannot call non-static function \"" + e["callee"]["name"] + "()\" from " + who + ".", "loc": e["loc"]})
		_sa_expr(diags, e["callee"], local, instance_vars, instance_funcs, who)
		for a in e["args"]:
			_sa_expr(diags, a, local, instance_vars, instance_funcs, who)
		return
	if kind == "index":
		_sa_expr(diags, e["obj"], local, instance_vars, instance_funcs, who)
		_sa_expr(diags, e["index"], local, instance_vars, instance_funcs, who)
		return
	if kind == "attribute":
		_sa_expr(diags, e["obj"], local, instance_vars, instance_funcs, who)
		return
	if kind == "binary":
		_sa_expr(diags, e["left"], local, instance_vars, instance_funcs, who)
		_sa_expr(diags, e["right"], local, instance_vars, instance_funcs, who)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_sa_expr(diags, e["operand"], local, instance_vars, instance_funcs, who)
		return
	if kind == "array":
		for it in e["items"]:
			_sa_expr(diags, it, local, instance_vars, instance_funcs, who)
		return
	if kind == "dict":
		for en in e["entries"]:
			_sa_expr(diags, en["key"], local, instance_vars, instance_funcs, who)
			_sa_expr(diags, en["value"], local, instance_vars, instance_funcs, who)
		return
	if kind == "lambda":
		for st in e["body"]:
			_sa_stmt(diags, st, local, instance_vars, instance_funcs, who)


static func _sa_stmt(diags, s, local, instance_vars, instance_funcs, who):
	var kind = s.get("kind")
	if kind == "expr":
		_sa_expr(diags, s["expr"], local, instance_vars, instance_funcs, who)
	elif kind == "var":
		if s.get("init") != null:
			_sa_expr(diags, s["init"], local, instance_vars, instance_funcs, who)
	elif kind == "assign":
		_sa_expr(diags, s["target"], local, instance_vars, instance_funcs, who)
		_sa_expr(diags, s["value"], local, instance_vars, instance_funcs, who)
	elif kind == "if":
		for br in s["branches"]:
			if br.get("cond") != null:
				_sa_expr(diags, br["cond"], local, instance_vars, instance_funcs, who)
			for x in br["body"]:
				_sa_stmt(diags, x, local, instance_vars, instance_funcs, who)
	elif kind == "for":
		_sa_expr(diags, s["iter"], local, instance_vars, instance_funcs, who)
		for x in s["body"]:
			_sa_stmt(diags, x, local, instance_vars, instance_funcs, who)
	elif kind == "while":
		_sa_expr(diags, s["cond"], local, instance_vars, instance_funcs, who)
		for x in s["body"]:
			_sa_stmt(diags, x, local, instance_vars, instance_funcs, who)
	elif kind == "match":
		_sa_expr(diags, s["subject"], local, instance_vars, instance_funcs, who)
		for arm in s["arms"]:
			if arm.get("guard") != null:
				_sa_expr(diags, arm["guard"], local, instance_vars, instance_funcs, who)
			for x in arm["body"]:
				_sa_stmt(diags, x, local, instance_vars, instance_funcs, who)
	elif kind == "return":
		if s.get("value") != null:
			_sa_expr(diags, s["value"], local, instance_vars, instance_funcs, who)


static func check_static_access(funcs, vars, diags):
	var instance_vars = {}
	for v in vars:
		if v.get("isConst") != true and v.get("isStatic") != true:
			instance_vars[v["name"]] = true
	var instance_funcs = {}
	for f in funcs:
		if f.get("isStatic") != true:
			instance_funcs[f["name"]] = true
	if instance_vars.is_empty() and instance_funcs.is_empty():
		return
	var contexts = []
	for f in funcs:
		if f.get("isStatic") == true:
			var names = []
			for p in f["params"]:
				names.append(p["name"])
			contexts.append({"who": "the static function \"" + f["name"] + "()\"", "body": f["body"], "init": null, "params": names})
	for v in vars:
		if v.get("isStatic") != true:
			continue
		contexts.append({"who": "a static variable initializer", "body": [], "init": v.get("init"), "params": []})
		var a = v.get("accessor")
		if a == null:
			continue
		var getter = a.get("getter")
		if getter != null and getter.get("kind") == "inline":
			contexts.append({"who": "the static function \"@" + v["name"] + "_getter()\"", "body": getter["body"], "init": null, "params": []})
		var setter = a.get("setter")
		if setter != null and setter.get("kind") == "inline":
			contexts.append({"who": "the static function \"@" + v["name"] + "_setter()\"", "body": setter["body"], "init": null, "params": [setter["param"]]})
	for ctx in contexts:
		var local = {}
		WK.collect_local_names(ctx["body"], ctx["params"], local)
		if ctx["init"] != null:
			_sa_expr(diags, ctx["init"], local, instance_vars, instance_funcs, ctx["who"])
		for s in ctx["body"]:
			_sa_stmt(diags, s, local, instance_vars, instance_funcs, ctx["who"])


static func check_ctor_signatures(m, diags):
	var shadowed = {}
	for f in m["funcs"]:
		shadowed[f["name"]] = true
	for nodes in WK.flatten_bodies(m):
		var arg_types = {}
		for n in nodes:
			if n.get("kind") != "var":
				continue
			var t = n.get("type")
			var nm = n.get("name")
			if t != null and t.get("kind") == "named" and nm != null:
				arg_types[nm] = t["name"]
		for n in nodes:
			if n.get("kind") != "call":
				continue
			var callee = n.get("callee")
			if callee == null or callee.get("kind") != "ident" or callee.get("name") == null:
				continue
			var name = callee["name"]
			if shadowed.has(name):
				continue
			var bad = O.CTOR_REFUSED.get(name)
			if bad == null:
				continue
			var kinds = []
			var missing = false
			for a in n["args"]:
				var k = SL.ctor_arg_name(a, arg_types)
				if k == null:
					missing = true
					break
				kinds.append(k)
			if missing:
				continue
			var sig = ", ".join(kinds)
			var hit = false
			for row in bad:
				if ", ".join(row) == sig:
					hit = true
					break
			if not hit:
				continue
			diags.append({"code": "ctor-signature", "message": "No constructor of \"" + name + "\" matches the signature \"" + name + "(" + sig + ")\".", "loc": n.get("loc")})

static func check_string_method_arity(m, diags):
	var assigned = WK.module_assigned_names(m)
	for scope in FC.face_scopes(m, "String", "string_lit"):
		var nodes = scope["nodes"]
		var seeded = scope["seeded"]
		var strs = FC.face_receiver_names(nodes, seeded, assigned, "String", "string_lit")
		var str_ann = FC.face_receiver_names(nodes, seeded, assigned, "String", "string_lit", true)
		var reads = {}
		for v in m["vars"]:
			if v.get("type") != null and v["type"].get("kind") == "named" and FC.read_face_of(v["type"]["name"], null) != null:
				reads[v["name"]] = v["type"]["name"]
		for n in nodes:
			if n.get("kind") == "var" and n.get("name") != null and n.get("type") != null and n["type"].get("kind") == "named" and FC.read_face_of(n["type"]["name"], null) != null:
				reads[n["name"]] = n["type"]["name"]
		var extra = {"reads": reads}
		for n in nodes:
			var d = AR.container_call_arity(n, T.STRING_ARITY, "string-arity", strs, "string_lit_or_read", extra)
			if d != null:
				diags.append(d)
			for g in AR.face_ghost_diags(n, T.STRING_ARITY, "String", true, str_ann, "string_lit", extra):
				diags.append(g)

static func _nf_arg_ann(arg_ann_all, body):
	for entry in arg_ann_all:
		if entry["body"] == body:
			return entry["ann"]
	return {}


static func _nf_put(by_pos, pos, code, message):
	var bucket = by_pos.get(pos)
	if bucket == null:
		bucket = []
		by_pos[pos] = bucket
	for d in bucket:
		if d["message"] == message:
			return
	bucket.append({"code": code, "message": message})


static func _nf_text(method, pos, want, bad):
	return "Invalid argument for \"" + method + "()\" function: argument " + str(pos) + " should be \"" + want + "\" but is \"" + bad + "\"."


static func check_named_face(m, face, diags):
	var tag = face["lit"] + "_lit_or_ctor"
	var assigned = WK.module_assigned_names(m)
	var arg_ann_all = FC.arg_name_scopes(m)
	for scope in FC.face_scopes(m, face["type"], tag):
		var nodes = scope["nodes"]
		var seeded = scope["seeded"]
		var names = FC.face_receiver_names(nodes, seeded, assigned, face["type"], tag)
		var arg_ann = _nf_arg_ann(arg_ann_all, scope["body"])
		for n in nodes:
			if n.get("kind") != "call":
				continue
			var callee = n.get("callee")
			if callee == null or callee.get("kind") != "attribute":
				continue
			var obj = callee.get("obj")
			if obj == null:
				continue
			var method = callee.get("name")
			if method == null:
				continue
			var proven = AR._is_literal_obj(obj, tag, null)
			if not proven and obj.get("kind") == "ident" and obj.get("name") != null and names.has(obj["name"]):
				proven = true
			if not proven:
				continue
			var loc = n.get("loc")
			var d = AR.arity_diag(face["arity"], face["arityCode"], method, n["args"].size(), loc)
			if d != null:
				diags.append(d)
			var fkey = face["type"] + "." + method
			var got = n["args"]
			var by_pos = {}
			for table in [O.FACE_ARG_AS.get(fkey), O.INSTANCE_ARG_AS.get(fkey)]:
				if table == null:
					continue
				for row in table:
					var pos = row[0]
					var refuse = row[1]
					var want = row[2]
					var also = row[3]
					if got.size() < pos:
						continue
					var lit = got[pos - 1]
					var bad = FC.literal_type_name(lit)
					if bad != null:
						var null_slot = bad == "null" and SL.null_refused_by_value_slot(want)
						if not refuse.has(bad) and not null_slot:
							continue
						_nf_put(by_pos, pos, "face-arg-pass", "Cannot pass a value of type \"" + bad + "\" as \"" + want + "\".")
						if null_slot or also.has(bad):
							_nf_put(by_pos, pos, "face-arg-type", _nf_text(method, pos, want, bad))
						continue
					var named = FC.arg_name_type(lit, arg_ann)
					if named == null:
						continue
					if not SL.object_name_refused_by_value_slot(named, want) and (not AR.face_list_has(refuse, named) or not AR.face_list_has(also, named)):
						continue
					_nf_put(by_pos, pos, "face-arg-type", _nf_text(method, pos, want, named))
			for table2 in [O.FACE_ARG_TYPES.get(fkey), O.INSTANCE_ARG_TYPES.get(fkey)]:
				if table2 == null:
					continue
				for row2 in table2:
					var pos2 = row2[0]
					var refuse2 = row2[1]
					var want2 = row2[2]
					if got.size() < pos2:
						continue
					var lit2 = got[pos2 - 1]
					var bad2 = FC.literal_type_name(lit2)
					if bad2 != null:
						if not refuse2.has(bad2) and not (bad2 == "null" and SL.null_refused_by_value_slot(want2)):
							continue
						_nf_put(by_pos, pos2, "face-arg-type", _nf_text(method, pos2, want2, bad2))
						continue
					var named2 = FC.arg_name_type(lit2, arg_ann)
					if named2 == null:
						continue
					if not SL.object_name_refused_by_value_slot(named2, want2) and not AR.face_list_has(refuse2, named2):
						continue
					_nf_put(by_pos, pos2, "face-arg-type", _nf_text(method, pos2, want2, named2))
			var positions = by_pos.keys()
			positions.sort()
			for pos3 in positions:
				for dd in by_pos[pos3]:
					diags.append({"code": dd["code"], "message": dd["message"], "loc": loc})

static func _fas_scan(node, out):
	if node is Array:
		for x in node:
			_fas_scan(x, out)
		return
	if not (node is Dictionary):
		return
	if node.get("kind") == "lambda":
		return
	out.append(node)
	for k in node.keys():
		if k == "loc":
			continue
		_fas_scan(node[k], out)


static func _fas_sigs_for(module_sigs, classes, c):
	var out = module_sigs.duplicate()
	var chain = []
	var seen = {}
	var cur = c
	while cur != null and not seen.has(cur["name"]):
		seen[cur["name"]] = true
		chain.push_front(cur)
		cur = classes.get(cur.get("extends"))
	for cc in chain:
		for f in cc["funcs"]:
			out[f["name"]] = f["params"]
	return out


static func _fas_body(diags, body, sigs, class_slots):
	var nodes = []
	_fas_scan(body, nodes)
	for n in nodes:
		if n.get("kind") != "call":
			continue
		var callee = n.get("callee")
		if callee == null:
			continue
		var fname = null
		if callee.get("kind") == "ident" and callee.get("name") != null:
			fname = callee["name"]
		elif callee.get("kind") == "attribute" and callee.get("name") != null:
			var base = callee.get("obj")
			if base != null and base.get("kind") == "ident" and base.get("name") == "self":
				fname = callee["name"]
		if fname == null:
			continue
		var params = sigs.get(fname)
		if params == null:
			continue
		var args = n.get("args")
		if args == null:
			args = []
		if args.size() != params.size():
			continue
		for i in args.size():
			var ptype = params[i].get("type")
			var slot = SL.func_slot_name(ptype)
			var src = SL.slot_source(args[i])
			if src == null:
				continue
			var loc = n.get("loc")
			if slot != null:
				var accept = SL.FUNC_ARG_SLOTS[slot]
				if accept.has(src):
					continue
				if src != "Array" and src != "Dictionary":
					diags.append({"code": "func-arg-slot", "message": "Cannot pass a value of type \"" + src + "\" as \"" + slot + "\".", "loc": loc})
				diags.append({
					"code": "func-arg-slot",
					"message": "Invalid argument for \"" + fname + "()\" function: argument " + str(i + 1) + " should be \"" + slot + "\" but is \"" + src + "\".",
					"loc": loc,
				})
				continue
			if ptype == null or ptype.get("kind") != "named" or src == "null":
				continue
			var cname = ptype["name"]
			var open = cname.find("[")
			if open >= 0:
				cname = cname.substr(0, open)
			if not class_slots.has(cname):
				continue
			if src == "Array" or src == "Dictionary" or cname == src:
				continue
			if not (src == "int" or src == "float" or src == "bool" or src == "String" or src == "StringName"):
				continue
			diags.append({
				"code": "func-arg-class-slot",
				"message": "Invalid argument for \"" + fname + "()\" function: argument " + str(i + 1) + " should be \"" + cname + "\" but is \"" + src + "\".",
				"loc": loc,
			})


static func check_func_arg_slots(m, globals, diags):
	var class_slots = SL.class_slot_names(m, globals)
	var module_sigs = {}
	for f in m["funcs"]:
		module_sigs[f["name"]] = f["params"]
	var classes = WK.class_table(m)
	for f in m["funcs"]:
		_fas_body(diags, f["body"], module_sigs, class_slots)
	_fas_classes(diags, m["innerClasses"], module_sigs, classes, class_slots)


static func _fas_classes(diags, list, module_sigs, classes, class_slots):
	for c in list:
		var sigs = _fas_sigs_for(module_sigs, classes, c)
		for f in c["funcs"]:
			_fas_body(diags, f["body"], sigs, class_slots)
		_fas_classes(diags, c["innerClasses"], module_sigs, classes, class_slots)

static func _vm_key(node):
	var loc = node.get("loc")
	if loc == null:
		return "?"
	return str(loc["line"]) + ":" + str(loc["col"])


static func _vm_face_ann(t) -> Variant:
	if t == null or t.get("kind") != "named":
		return null
	return t["name"] if O.FACE_ANNOTATIONS.has(t["name"]) else null


static func _vm_note_elem(out, name, t):
	if t != null and t.get("kind") == "named" and FC.read_face_of(t["name"], null) != null:
		out[name] = t["name"]


static func _vm_note_name_face(out, name, t):
	var f = FC.known_face_annotation(t)
	if f != null:
		out[name] = f


static func _vm_recv_elem(cx, obj) -> Variant:
	if obj.get("kind") != "index" or obj["obj"].get("kind") != "ident":
		return null
	var decl = cx["elemFaces"].get(obj["obj"]["name"])
	return FC.read_face_of("" if decl == null else decl, FC.static_type(obj["index"]))


static func _vm_recv_owner(cx, obj) -> Variant:
	var via = FC.literal_face_type(obj, cx["faceTyped"])
	if via != null:
		return via
	var kind = obj.get("kind")
	if kind == "ident":
		var a = cx["typed"].get(obj["name"])
		if a == null:
			a = cx["nameFaces"].get(obj["name"])
		return a
	if kind == "index":
		return _vm_recv_elem(cx, obj)
	if kind == "call":
		var v = AR.value_ctor_type(obj)
		if v != null:
			return v
		if obj["callee"].get("kind") != "attribute":
			return null
		return FC.chain_recv_face(obj, _vm_recv_owner(cx, obj["callee"]["obj"]))
	return null


static func _vm_recv_chain(cx, obj) -> Variant:
	if obj.get("kind") != "call" or obj["callee"].get("kind") != "attribute":
		return null
	return FC.chain_recv_face(obj, _vm_recv_owner(cx, obj["callee"]["obj"]))


static func _vm_static_sig(recv, method) -> Variant:
	var tbl = AR.class_face_arity(recv)
	if tbl == null:
		tbl = T.VALUE_ARITY.get(recv)
	if tbl == null or not tbl.has(method):
		return null
	return tbl[method]


static func _vm_face_static_sig(recv, method) -> Variant:
	var face = T.STATIC_FACE.get(recv)
	if face == null:
		return null
	return face["statics"].get(method)


static func _vm_collect(list, funcs):
	for c in list:
		var fields = {}
		var name_fields = {}
		for v in c["vars"]:
			var ft = _vm_face_ann(v.get("type"))
			if ft != null:
				fields[v["name"]] = ft
			else:
				var vt = FC.value_type_annotation(v.get("type"))
				if vt != null:
					fields[v["name"]] = vt
				else:
					var nf = FC.known_face_annotation(v.get("type"))
					if nf != null and not T.PACK_ARG_SLOTS.has(nf):
						name_fields[v["name"]] = nf
		for f in c["funcs"]:
			funcs.append({"f": f, "base": {}, "fields": fields, "nameFields": name_fields})
		_vm_collect(c["innerClasses"], funcs)


static func _vm_walk_expr(e, calls, static_callees, diags):
	var kind = e.get("kind")
	if kind == "attribute":
		if not static_callees.has(_vm_key(e)) and e["obj"].get("kind") == "ident":
			for d in AR.static_bare_diags(e["obj"]["name"], e["name"]):
				diags.append({"code": d["code"], "message": d["message"], "loc": e["loc"]})
		_vm_walk_expr(e["obj"], calls, static_callees, diags)
		return
	if kind == "index":
		_vm_walk_expr(e["obj"], calls, static_callees, diags)
		_vm_walk_expr(e["index"], calls, static_callees, diags)
		return
	if kind == "binary":
		_vm_walk_expr(e["left"], calls, static_callees, diags)
		_vm_walk_expr(e["right"], calls, static_callees, diags)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_vm_walk_expr(e["operand"], calls, static_callees, diags)
		return
	if kind == "array":
		for it in e["items"]:
			_vm_walk_expr(it, calls, static_callees, diags)
		return
	if kind == "dict":
		for en in e["entries"]:
			_vm_walk_expr(en["key"], calls, static_callees, diags)
			_vm_walk_expr(en["value"], calls, static_callees, diags)
		return
	if kind == "call":
		calls.append(e)
		if e["callee"].get("kind") == "attribute" and e["callee"]["obj"].get("kind") == "ident":
			var recv = e["callee"]["obj"]["name"]
			if T.STATIC_FACE.has(recv) or T.BUILTIN_NEW_ABSENT_FACES.has(recv):
				static_callees[_vm_key(e["callee"])] = true
		_vm_walk_expr(e["callee"], calls, static_callees, diags)
		for a in e["args"]:
			_vm_walk_expr(a, calls, static_callees, diags)
		return


static func _vm_walk_stmt(s, calls, static_callees, var_decls, assigned, diags):
	var kind = s.get("kind")
	if kind == "expr":
		_vm_walk_expr(s["expr"], calls, static_callees, diags)
		return
	if kind == "var":
		var_decls.append(s)
		if s.get("init") != null:
			_vm_walk_expr(s["init"], calls, static_callees, diags)
		return
	if kind == "assign":
		if s["target"].get("kind") == "ident":
			assigned[s["target"]["name"]] = true
		_vm_walk_expr(s["target"], calls, static_callees, diags)
		_vm_walk_expr(s["value"], calls, static_callees, diags)
		return
	if kind == "if":
		for br in s["branches"]:
			if br.get("cond") != null:
				_vm_walk_expr(br["cond"], calls, static_callees, diags)
			for x in br["body"]:
				_vm_walk_stmt(x, calls, static_callees, var_decls, assigned, diags)
		return
	if kind == "for":
		_vm_walk_expr(s["iter"], calls, static_callees, diags)
		for x in s["body"]:
			_vm_walk_stmt(x, calls, static_callees, var_decls, assigned, diags)
		return
	if kind == "while":
		_vm_walk_expr(s["cond"], calls, static_callees, diags)
		for x in s["body"]:
			_vm_walk_stmt(x, calls, static_callees, var_decls, assigned, diags)
		return
	if kind == "match":
		_vm_walk_expr(s["subject"], calls, static_callees, diags)
		for arm in s["arms"]:
			if arm.get("guard") != null:
				_vm_walk_expr(arm["guard"], calls, static_callees, diags)
			for x in arm["body"]:
				_vm_walk_stmt(x, calls, static_callees, var_decls, assigned, diags)
		return
	if kind == "return":
		if s.get("value") != null:
			_vm_walk_expr(s["value"], calls, static_callees, diags)
		return


static func _vm_put(by_pos, pos, code, message):
	var bucket = by_pos.get(pos)
	if bucket == null:
		bucket = []
		by_pos[pos] = bucket
	for d in bucket:
		if d["message"] == message:
			return
	bucket.append({"code": code, "message": message})


static func _vm_emit(diags, by_pos, loc):
	var positions = by_pos.keys()
	positions.sort()
	for pos in positions:
		for d in by_pos[pos]:
			diags.append({"code": d["code"], "message": d["message"], "loc": loc})


static func _vm_arg_text(method, pos, want, bad):
	return "Invalid argument for \"" + method + "()\" function: argument " + str(pos) + " should be \"" + want + "\" but is \"" + bad + "\"."


static func _vm_static_args(e, callee, arg_ann, diags):
	var skey = callee["obj"]["name"] + "." + callee["name"]
	var by_pos = {}
	var want_at = {}
	var refuse_at = {}
	for row in O.STATIC_ARG_AS.get(skey, []):
		var pos = row[0]
		var refuse = row[1]
		var want = row[2]
		var also = row[3]
		var got = FC.literal_type_name(e["args"][pos - 1]) if e["args"].size() >= pos else null
		if got != null and refuse.has(got):
			_vm_put(by_pos, pos, "static-arg-pass", "Cannot pass a value of type \"" + got + "\" as \"" + want + "\".")
			if also.has(got):
				_vm_put(by_pos, pos, "static-arg-type", _vm_arg_text(callee["name"], pos, want, got))
		want_at[pos] = want
		var prev = refuse_at.get(pos)
		refuse_at[pos] = refuse.duplicate() if prev == null else prev + refuse
	for row2 in O.STATIC_ARG_TYPES.get(skey, []):
		var pos2 = row2[0]
		var refuse2 = row2[1]
		var want2 = row2[2]
		var got2 = FC.literal_type_name(e["args"][pos2 - 1]) if e["args"].size() >= pos2 else null
		if got2 != null and refuse2.has(got2):
			_vm_put(by_pos, pos2, "static-arg-type", _vm_arg_text(callee["name"], pos2, want2, got2))
		var prev2 = refuse_at.get(pos2)
		refuse_at[pos2] = refuse2.duplicate() if prev2 == null else prev2 + refuse2
	for pos3 in want_at.keys():
		if e["args"].size() < pos3:
			continue
		var arg = e["args"][pos3 - 1]
		if FC.literal_type_name(arg) != null:
			continue
		var nm = FC.arg_name_type(arg, arg_ann)
		var refuses = refuse_at.get(pos3)
		if nm == null or refuses == null or not refuses.has(nm):
			continue
		_vm_put(by_pos, pos3, "static-arg-type", _vm_arg_text(callee["name"], pos3, want_at[pos3], nm))
	_vm_emit(diags, by_pos, e["loc"])


static func _vm_face_args(e, callee, fkey, arg_ann, diags):
	var by_pos = {}
	for row in O.FACE_ARG_AS.get(fkey, []):
		var pos = row[0]
		var refuse = row[1]
		var want = row[2]
		var also = row[3]
		var arg = e["args"][pos - 1] if e["args"].size() >= pos else null
		var bad = FC.literal_type_name(arg) if arg != null else null
		if bad != null:
			var null_slot = bad == "null" and SL.null_refused_by_value_slot(want)
			if not refuse.has(bad) and not null_slot:
				continue
			_vm_put(by_pos, pos, "face-arg-pass", "Cannot pass a value of type \"" + bad + "\" as \"" + want + "\".")
			if null_slot or also.has(bad):
				_vm_put(by_pos, pos, "face-arg-type", _vm_arg_text(callee["name"], pos, want, bad))
			continue
		var named = FC.arg_name_type(arg, arg_ann) if arg != null else null
		if named == null:
			continue
		if not SL.object_name_refused_by_value_slot(named, want) and (not AR.face_list_has(refuse, named) or not AR.face_list_has(also, named)):
			continue
		_vm_put(by_pos, pos, "face-arg-type", _vm_arg_text(callee["name"], pos, want, named))
	for row2 in O.FACE_ARG_TYPES.get(fkey, []):
		var pos2 = row2[0]
		var refuse2 = row2[1]
		var want2 = row2[2]
		var arg2 = e["args"][pos2 - 1] if e["args"].size() >= pos2 else null
		var bad2 = FC.literal_type_name(arg2) if arg2 != null else null
		if bad2 != null:
			if not refuse2.has(bad2) and not (bad2 == "null" and SL.null_refused_by_value_slot(want2)):
				continue
			_vm_put(by_pos, pos2, "face-arg-type", _vm_arg_text(callee["name"], pos2, want2, bad2))
			continue
		var named2 = FC.arg_name_type(arg2, arg_ann) if arg2 != null else null
		if named2 == null:
			continue
		if not SL.object_name_refused_by_value_slot(named2, want2) and not AR.face_list_has(refuse2, named2):
			continue
		_vm_put(by_pos, pos2, "face-arg-type", _vm_arg_text(callee["name"], pos2, want2, named2))
	_vm_emit(diags, by_pos, e["loc"])


static func _vm_instance_args(e, callee, ikey, arg_ann, use_names, diags):
	var by_pos = {}
	for row in O.INSTANCE_ARG_AS.get(ikey, []):
		var pos = row[0]
		var refuse = row[1]
		var want = row[2]
		var also = row[3]
		var lit = e["args"][pos - 1] if e["args"].size() >= pos else null
		var bad = FC.literal_type_name(lit) if lit != null else null
		if bad != null:
			var null_slot = bad == "null" and SL.null_refused_by_value_slot(want)
			if not refuse.has(bad) and not null_slot:
				continue
			_vm_put(by_pos, pos, "instance-arg-pass", "Cannot pass a value of type \"" + bad + "\" as \"" + want + "\".")
			if null_slot or also.has(bad):
				_vm_put(by_pos, pos, "instance-arg-type", _vm_arg_text(callee["name"], pos, want, bad))
			continue
		var named = FC.arg_name_type(lit, arg_ann) if (lit != null and use_names) else null
		if named == null:
			continue
		if not SL.object_name_refused_by_value_slot(named, want) and (not AR.face_list_has(refuse, named) or not AR.face_list_has(also, named)):
			continue
		_vm_put(by_pos, pos, "instance-arg-type", _vm_arg_text(callee["name"], pos, want, named))
	for row2 in O.INSTANCE_ARG_TYPES.get(ikey, []):
		var pos2 = row2[0]
		var refuse2 = row2[1]
		var want2 = row2[2]
		var lit2 = e["args"][pos2 - 1] if e["args"].size() >= pos2 else null
		var bad2 = FC.literal_type_name(lit2) if lit2 != null else null
		if bad2 != null:
			if not refuse2.has(bad2) and not (bad2 == "null" and SL.null_refused_by_value_slot(want2)):
				continue
			_vm_put(by_pos, pos2, "instance-arg-type", _vm_arg_text(callee["name"], pos2, want2, bad2))
			continue
		var named2 = FC.arg_name_type(lit2, arg_ann) if (lit2 != null and use_names) else null
		if named2 == null:
			continue
		if not SL.object_name_refused_by_value_slot(named2, want2) and not AR.face_list_has(refuse2, named2):
			continue
		_vm_put(by_pos, pos2, "instance-arg-type", _vm_arg_text(callee["name"], pos2, want2, named2))
	_vm_emit(diags, by_pos, e["loc"])


static func check_value_method_arity(m, diags):
	var module_vars = {}
	for v in m["vars"]:
		var t = FC.value_type_annotation(v.get("type"))
		if t == null and v.get("type") == null:
			t = AR.value_ctor_type(v.get("init"))
		if t != null:
			module_vars[v["name"]] = t
	var funcs = []
	for f in m["funcs"]:
		funcs.append({"f": f, "base": module_vars, "fields": {}, "nameFields": {}})
	_vm_collect(m["innerClasses"], funcs)
	var arg_ann_all = FC.arg_name_scopes(m)
	for item in funcs:
		_vm_one(m, item, arg_ann_all, diags)


static func _vm_one(m, item, arg_ann_all, diags):
	var f = item["f"]
	var typed = item["base"].duplicate()
	var arg_ann = _nf_arg_ann(arg_ann_all, f["body"])
	var face_typed = {}
	for v in m["vars"]:
		var ft = _vm_face_ann(v.get("type"))
		if ft != null:
			face_typed[v["name"]] = ft
	for p in f["params"]:
		var t = FC.value_type_annotation(p.get("type"))
		if t != null:
			typed[p["name"]] = t
		var pt = _vm_face_ann(p.get("type"))
		if pt != null:
			face_typed[p["name"]] = pt
	for name in item["fields"]:
		var ft2 = item["fields"][name]
		if O.FACE_ANNOTATIONS.has(ft2):
			face_typed[name] = ft2
		else:
			typed[name] = ft2
	var elem_faces = {}
	for v in m["vars"]:
		_vm_note_elem(elem_faces, v["name"], v.get("type"))
	for prm in f["params"]:
		_vm_note_elem(elem_faces, prm["name"], prm.get("type"))
	for n in WK.flatten_body(f["body"]):
		if n.get("kind") == "var" and n.get("name") != null:
			_vm_note_elem(elem_faces, n["name"], n.get("type"))
	var name_faces = {}
	for v in m["vars"]:
		_vm_note_name_face(name_faces, v["name"], v.get("type"))
	for prm in f["params"]:
		_vm_note_name_face(name_faces, prm["name"], prm.get("type"))
	for n in WK.flatten_body(f["body"]):
		if n.get("kind") == "var" and n.get("name") != null:
			_vm_note_name_face(name_faces, n["name"], n.get("type"))
	for name in item["nameFields"]:
		name_faces[name] = item["nameFields"][name]
	var cx = {"typed": typed, "faceTyped": face_typed, "nameFaces": name_faces, "elemFaces": elem_faces}
	var calls = []
	var static_callees = {}
	var var_decls = []
	var assigned = {}
	for s in f["body"]:
		_vm_walk_stmt(s, calls, static_callees, var_decls, assigned, diags)
	for d in var_decls:
		if d.get("type") == null and assigned.has(d["name"]):
			continue
		var dt = FC.value_type_annotation(d.get("type"))
		if dt == null and d.get("type") == null:
			dt = AR.value_ctor_type(d.get("init"))
		if dt != null:
			typed[d["name"]] = dt
		var dft = _vm_face_ann(d.get("type"))
		if dft != null:
			face_typed[d["name"]] = dft
		if d.get("type") == null and d.get("init") != null:
			var inferred = FC.literal_face_type(d["init"], {})
			if inferred != null:
				face_typed[d["name"]] = inferred
	for e in calls:
		var callee = e["callee"]
		if callee.get("kind") != "attribute":
			continue
		var obj = callee["obj"]
		if obj.get("kind") == "ident" and (T.STATIC_FACE.has(obj["name"]) or T.PACK_TYPE_NAMES.has(obj["name"]) or AR.class_face_arity(obj["name"]) != null):
			for d in AR.static_call_diags(obj["name"], callee["name"], e["args"].size()):
				diags.append({"code": d["code"], "message": d["message"], "loc": e["loc"]})
			var cls_sig = _vm_static_sig(obj["name"], callee["name"])
			var static_sig = _vm_face_static_sig(obj["name"], callee["name"])
			if static_sig == null and cls_sig != null:
				for d in SL.class_face_arg_diags(e, obj["name"], callee["name"], arg_ann):
					diags.append({"code": d["code"], "message": d["message"], "loc": e["loc"]})
				if e["args"].size() < cls_sig[0]:
					diags.append({"code": "value-arity", "message": "Too few arguments for \"" + callee["name"] + "()\" call. Expected at least " + str(cls_sig[0]) + " but received " + str(e["args"].size()) + ".", "loc": e["loc"]})
				elif e["args"].size() > cls_sig[1]:
					diags.append({"code": "value-arity", "message": "Too many arguments for \"" + callee["name"] + "()\" call. Expected at most " + str(cls_sig[1]) + " but received " + str(e["args"].size()) + ".", "loc": e["loc"]})
			var bounds = static_sig
			if bounds != null and e["args"].size() >= bounds[0] and e["args"].size() <= bounds[1]:
				_vm_static_args(e, callee, arg_ann, diags)
			continue
		var chain_arg_face = _vm_recv_chain(cx, obj)
		var lit_face = FC.literal_face_type(obj, face_typed)
		var face = lit_face
		if face == null and (chain_arg_face == "String" or chain_arg_face == "StringName" or chain_arg_face == "NodePath"):
			face = chain_arg_face
		if face != null:
			_vm_face_args(e, callee, face + "." + callee["name"], arg_ann, diags)
			if lit_face != null:
				continue
		var direct = null
		if obj.get("kind") == "ident":
			direct = typed.get(obj["name"])
		elif obj.get("kind") == "index":
			direct = _vm_recv_elem(cx, obj)
		else:
			direct = AR.value_ctor_type(obj)
		var recv = direct
		if recv == null:
			recv = _vm_recv_chain(cx, obj)
		if recv == null:
			continue
		var arity = null
		if direct == null:
			arity = AR.chain_arity_face(recv)
		else:
			arity = {"table": T.VALUE_ARITY.get(recv, {}), "code": "value-arity"}
		var sig = arity["table"].get(callee["name"])
		if sig == null:
			continue
		var got = e["args"].size()
		var ikey = recv + "." + callee["name"]
		_vm_instance_args(e, callee, ikey, arg_ann, obj.get("kind") != "index", diags)
		if got >= sig[0] and got <= sig[1]:
			continue
		if got < sig[0]:
			diags.append({"code": arity["code"], "message": "Too few arguments for \"" + callee["name"] + "()\" call. Expected at least " + str(sig[0]) + " but received " + str(got) + ".", "loc": e["loc"]})
		else:
			diags.append({"code": arity["code"], "message": "Too many arguments for \"" + callee["name"] + "()\" call. Expected at most " + str(sig[1]) + " but received " + str(got) + ".", "loc": e["loc"]})
	_vm_globals(calls, arg_ann, diags)


static func _vm_globals(calls, arg_ann, diags):
	for e in calls:
		var callee = e["callee"]
		if callee.get("kind") != "ident" or callee.get("name") != "char" or e["args"].size() != 1:
			continue
		var v = SL.literal_int_arg(e["args"][0])
		if v == null or (v >= 0 and v <= 4294967295):
			continue
		diags.append({"code": "char-range", "message": "Invalid argument for \"char()\" function: Expected an integer between 0 and 2^32 - 1.", "loc": e["loc"]})
	for e in calls:
		var callee = e["callee"]
		if callee.get("kind") != "ident":
			continue
		var name = callee["name"]
		var vararg = O.GLOBAL_ARG_VARARG.get(name)
		if vararg != null:
			var ar = T.BUILTIN_ARITY.get(name)
			var kinds = []
			for a in e["args"]:
				kinds.append(FC.literal_type_name(a))
			if ar != null and e["args"].size() >= ar[0] and e["args"].size() <= ar[1] and not kinds.has("Array") and not kinds.has("Dictionary"):
				for i in kinds.size():
					if kinds[i] != null and vararg.has(kinds[i]):
						diags.append({"code": "global-arg-type", "message": "Invalid argument for \"" + name + "()\" function: argument " + str(i + 1) + " should be \"float\" but is \"" + kinds[i] + "\".", "loc": e["loc"]})
						break
			continue
		_vm_global_one(e, name, arg_ann, diags)


static func _vm_global_one(e, name, arg_ann, diags):
	var spec = O.GLOBAL_ARG_TYPES.get(name)
	var follows = O.ARG_TYPE_FOLLOWS_FIRST.get(name)
	var should_rows = O.GLOBAL_ARG_SHOULD_BE.get(name)
	var sentence_rows = O.GLOBAL_ARG_SENTENCE.get(name)
	var as_rows = O.GLOBAL_ARG_AS.get(name)
	var has_literal_table = spec != null or follows != null or should_rows != null or sentence_rows != null or as_rows != null
	var typed_name = O.GLOBAL_TYPED_NAME_ARGS.get(name)
	if typed_name != null:
		var entry = GLOB.CALLABLES.get(name)
		var tb = null if entry == null else entry
		if tb == null or (e["args"].size() >= tb[0] and e["args"].size() <= tb[1]):
			for row in typed_name:
				var pos = row[0]
				var want = row[1]
				var accept = row[2]
				if e["args"].size() < pos:
					continue
				var arg = e["args"][pos - 1]
				var lit = FC.literal_type_name(arg)
				if lit != null and has_literal_table:
					continue
				var nm = lit
				if nm == null:
					nm = FC.arg_name_type(arg, arg_ann)
				if nm == null or accept.has(nm):
					continue
				diags.append({"code": "global-arg-type", "message": "Invalid argument for \"" + name + "()\" function: argument " + str(pos) + " should be \"" + want + "\" but is \"" + nm + "\".", "loc": e["loc"]})
	var entry2 = GLOB.CALLABLES.get(name)
	if entry2 == null or e["args"].size() < entry2[0] or e["args"].size() > entry2[1]:
		return
	if spec == null and follows == null and should_rows == null and sentence_rows == null and as_rows == null:
		return
	var should_pos = {}
	if should_rows != null:
		for row3 in should_rows:
			should_pos[row3[0]] = true
	var suppress = O.GLOBAL_ARG_SUPPRESS_OTHER.get(name)
	var by_pos = {}
	var follow_container = false
	if name == "clamp" or name == "lerp" or name == "wrap":
		for a in e["args"]:
			var k = FC.literal_type_name(a)
			if k == "Array" or k == "Dictionary":
				follow_container = true
				break
	var wants = []
	if spec != null:
		for row4 in spec:
			wants.append([row4[0], row4[1]])
	var bool_follows = null if follows == null else follows
	if follows != null:
		var first = null
		if e["args"].size() > 0:
			if O.GLOBAL_ARG_FOLLOWS_BOOL.has(name):
				first = FC.literal_type_name(e["args"][0])
			else:
				first = LF.numeric_literal_kind(e["args"][0])
		if first == "int" or first == "float" or first == "bool":
			for p in follows:
				wants.append([p, first])
	var bool_fixed = O.GLOBAL_ARG_BOOL_REFUSED.get(name)
	if bool_fixed == null:
		bool_fixed = []
	var hit = null
	for pair in wants:
		if follow_container:
			continue
		var pos = pair[0]
		var want = pair[1]
		if e["args"].size() < pos or should_pos.has(pos):
			continue
		if suppress != null and suppress[0] == pos:
			var other = false
			for i in e["args"].size():
				if i == pos - 1:
					continue
				var kk = FC.literal_type_name(e["args"][i])
				if kk != null and suppress[1].has(kk):
					other = true
					break
			if other:
				continue
		var a = e["args"][pos - 1]
		var lit = FC.literal_type_name(a)
		var got = null
		if want == "bool":
			if lit == "int" or lit == "float":
				got = lit
		else:
			got = LF.non_numeric_literal(a)
			if got == null and (bool_fixed.has(pos) or (bool_follows != null and bool_follows.has(pos))) and lit == "bool":
				got = "bool"
			if got == null and O.CUBIC_NAME_ARG_FUNCS.has(name) and lit == null:
				got = SL.name_arg_bad(a, arg_ann, want)
		if got == null or got == want:
			continue
		if hit == null or pos < hit["pos"]:
			hit = {"pos": pos, "got": got}
	if hit != null:
		var want_of = null
		for pair2 in wants:
			if pair2[0] == hit["pos"]:
				want_of = pair2[1]
				break
		_vm_put(by_pos, hit["pos"], "global-arg-type", _vm_arg_text(name, hit["pos"], want_of, hit["got"]))
	if spec != null and O.GLOBAL_NUM_ARITH.has(name):
		for row5 in spec:
			var pos5 = row5[0]
			var want5 = row5[1]
			if want5 != "float" and want5 != "int":
				continue
			if e["args"].size() < pos5:
				continue
			var arg5 = e["args"][pos5 - 1]
			if FC.literal_type_name(arg5) != null:
				continue
			var nm5 = FC.arg_name_type(arg5, arg_ann)
			if nm5 == null or nm5 == "bool" or nm5 == "int" or nm5 == "float":
				continue
			_vm_put(by_pos, pos5, "global-arg-type", _vm_arg_text(name, pos5, want5, nm5))
	var first_kind = FC.literal_type_name(e["args"][0]) if e["args"].size() > 0 else null
	var snapped_value_bad = false
	if name == "snapped" and first_kind != null and sentence_rows != null:
		for row6 in sentence_rows:
			if row6[0] == 1 and row6[1].has(first_kind):
				snapped_value_bad = true
				break
	var snapped_container = false
	if name == "snapped":
		for a2 in e["args"]:
			var k2 = FC.literal_type_name(a2)
			if k2 == "Array" or k2 == "Dictionary":
				snapped_container = true
				break
	if sentence_rows != null:
		for row7 in sentence_rows:
			var pos7 = row7[0]
			var refuse7 = row7[1]
			var sentence = row7[2]
			var unless7 = row7[3]
			if snapped_container or (snapped_value_bad and pos7 > 1):
				continue
			if e["args"].size() < pos7:
				continue
			var got7 = FC.literal_type_name(e["args"][pos7 - 1])
			if got7 == null or not refuse7.has(got7):
				continue
			if pos7 > 1 and first_kind != null and unless7.has(first_kind):
				continue
			_vm_put(by_pos, pos7, "global-arg-sentence", sentence)
	if as_rows != null:
		for row8 in as_rows:
			var pos8 = row8[0]
			var refuse8 = row8[1]
			var want8 = row8[2]
			var unless8 = row8[3]
			var also8 = row8[4]
			if e["args"].size() < pos8:
				continue
			var got8 = FC.literal_type_name(e["args"][pos8 - 1])
			if got8 == null or not refuse8.has(got8):
				continue
			if pos8 > 1 and first_kind != null and unless8.has(first_kind):
				continue
			_vm_put(by_pos, pos8, "global-arg-pass", "Cannot pass a value of type \"" + got8 + "\" as \"" + want8 + "\".")
			if also8.has(got8):
				_vm_put(by_pos, pos8, "global-arg-type", _vm_arg_text(name, pos8, want8, got8))
	if should_rows != null:
		for row9 in should_rows:
			var pos9 = row9[0]
			var refuse9 = row9[1]
			var want9 = row9[2]
			var unless9 = row9[3]
			if e["args"].size() < pos9:
				continue
			var got9 = FC.literal_type_name(e["args"][pos9 - 1])
			if got9 == null or not refuse9.has(got9):
				continue
			if pos9 > 1 and first_kind != null and unless9.has(first_kind):
				continue
			_vm_put(by_pos, pos9, "global-arg-type", _vm_arg_text(name, pos9, want9, got9))
	var derived = O.DERIVED_ARG_TYPES.get(name)
	if derived != null:
		for row10 in derived:
			var want10 = row10[0]
			var pos10 = row10[1]
			var refuse10 = row10[2]
			if follow_container or first_kind != want10:
				continue
			if e["args"].size() < pos10:
				continue
			var got10 = FC.literal_type_name(e["args"][pos10 - 1])
			if got10 == null or not refuse10.has(got10):
				continue
			if suppress != null and suppress[0] == pos10:
				var other10 = false
				for i10 in e["args"].size():
					if i10 == pos10 - 1:
						continue
					var kk10 = FC.literal_type_name(e["args"][i10])
					if kk10 != null and suppress[1].has(kk10):
						other10 = true
						break
				if other10:
					continue
			_vm_put(by_pos, pos10, "global-arg-derived", _vm_arg_text(name, pos10, want10, got10))
	_vm_emit(diags, by_pos, e["loc"])
