const AS = preload("res://analyze_state.gd")
const SL = preload("res://slots.gd")
const FC = preload("res://faces.gd")
const O = preload("res://op_tables.gd")


static func _ctor_class(e, script_names) -> Variant:
	if e.get("kind") != "call" or e["callee"].get("kind") != "attribute" or e["callee"].get("name") != "new":
		return null
	if e["callee"]["obj"].get("kind") != "ident":
		return null
	var name = e["callee"]["obj"]["name"]
	return name if script_names.has(name) else null


static func _call_type(e, funcs) -> Variant:
	if e.get("kind") != "call" or e["callee"].get("kind") != "attribute":
		return null
	if e["callee"]["obj"].get("kind") != "ident" or e["callee"]["obj"]["name"] != "self":
		return null
	var called = e["callee"]["name"]
	for f in funcs:
		if f["name"] == called:
			var t = f.get("returnType")
			if t != null and t.get("kind") == "named":
				return t["name"]
			return null
	return null


static func _st_of(e, decls, ctx) -> Variant:
	if e.get("kind") == "ident":
		return decls.get(e["name"])
	var c = _ctor_class(e, ctx["scriptNames"])
	if c != null:
		return c
	var s = SL.slot_source(e)
	if s != null:
		return s
	return _call_type(e, ctx["funcs"])


static func _sub_of(script_names, x, base):
	var cur = x
	for guard in 16:
		if cur == base:
			return true
		var p = script_names.get(cur)
		if p == null or p == "":
			return false
		cur = p
	return false


static func _bad_key(diags, slot, index, decls, ctx):
	var st = _st_of(index, decls, ctx)
	if st == null:
		return
	if slot["kind"] == "Array":
		if st == "int" or st == "float":
			return
		diags.append({"code": "typed-index-key", "message": "Invalid index type \"" + st + "\" for a base of type \"" + slot["decl"] + "\".", "loc": index["loc"]})
		return
	if not slot.has("key"):
		return
	if st == "null":
		return
	if ctx["scriptNames"].has(slot["key"]):
		if st == slot["key"]:
			return
		diags.append({"code": "typed-index-key", "message": "Invalid index type \"" + st + "\" for a base of type \"" + slot["decl"] + "\".", "loc": index["loc"]})
		return
	if (slot["key"] == "Vector4" and st == "Vector4i") or (slot["key"] == "Vector4i" and st == "Vector4"):
		diags.append({"code": "typed-index-key", "message": "Invalid index type \"" + st + "\" for a base of type \"" + slot["decl"] + "\".", "loc": index["loc"]})
		return
	if SL.can_hold(slot["key"], st):
		return
	diags.append({"code": "typed-index-key", "message": "Invalid index type \"" + st + "\" for a base of type \"" + slot["decl"] + "\".", "loc": index["loc"]})


static func _positional_slot(decl, init) -> Variant:
	if decl != null:
		var t = AS.parse_typed(decl)
		if t != null:
			return t if t["kind"] == "Array" else null
		if decl == "Array" or decl == "String" or O.PACK_SHAPE_NAMES.has(decl):
			return {"decl": decl, "kind": "Array"}
		return null
	if init == null:
		return null
	if init.get("kind") == "array":
		return {"decl": "Array", "kind": "Array"}
	if init.get("kind") == "lit" and init.get("lit") == "string":
		return {"decl": "String", "kind": "Array"}
	return null


static func _value_msg(diags, slot_kind, value, index, decls, ctx, dict_slot = false):
	var st = _st_of(value, decls, ctx)
	if st == null or st == "null":
		return
	if dict_slot and ctx["scriptNames"].has(slot_kind):
		if st == slot_kind or (ctx["scriptNames"].has(st) and _sub_of(ctx["scriptNames"], st, slot_kind)):
			return
		diags.append({"code": "typed-index-assign", "message": "Value of type \"" + st + "\" cannot be assigned to a variable of type \"" + slot_kind + "\".", "loc": value["loc"]})
		return
	if SL.can_hold(slot_kind, st):
		return
	if index.get("kind") == "lit":
		diags.append({"code": "typed-index-value", "message": "Cannot assign a value of type \"" + st + "\" as \"" + slot_kind + "\".", "loc": value["loc"]})
	diags.append({"code": "typed-index-assign", "message": "Value of type \"" + st + "\" cannot be assigned to a variable of type \"" + slot_kind + "\".", "loc": value["loc"]})


static func _is_walk_expr(e, typed, decls, ctx, diags):
	var kind = e.get("kind")
	if kind == "index":
		var r = AS.get_run()
		if e["obj"].get("kind") == "ident":
			var slot = typed.get(e["obj"]["name"])
			if slot != null:
				_bad_key(diags, slot, e["index"], decls, ctx)
				if slot["kind"] == "Dictionary" and _st_of(e["index"], decls, ctx) == "int":
					r["dictIntReads"][AS.di_key(r, e["loc"]["line"], e["loc"]["col"])] = true
				if slot["kind"] == "Array" and slot.get("ann") != null:
					r["posReadLabels"][AS.di_key(r, e["loc"]["line"], e["loc"]["col"])] = slot["ann"]
		elif e["obj"].get("kind") == "array":
			_bad_key(diags, {"decl": "Array", "kind": "Array"}, e["index"], decls, ctx)
		elif e["obj"].get("kind") == "dict":
			if _st_of(e["index"], decls, ctx) == "int":
				r["dictIntReads"][AS.di_key(r, e["loc"]["line"], e["loc"]["col"])] = true
		else:
			var own = null
			if e["obj"].get("kind") == "call":
				var ct = _call_type(e["obj"], ctx["funcs"])
				own = SL.dict_slot_of("" if ct == null else ct)
			if own != null and own["kind"] == "Dictionary" and _st_of(e["index"], decls, ctx) == "int":
				r["dictIntReads"][AS.di_key(r, e["loc"]["line"], e["loc"]["col"])] = true
		_is_walk_expr(e["obj"], typed, decls, ctx, diags)
		_is_walk_expr(e["index"], typed, decls, ctx, diags)
		return
	if kind == "binary":
		_is_walk_expr(e["left"], typed, decls, ctx, diags)
		_is_walk_expr(e["right"], typed, decls, ctx, diags)
		return
	if kind == "unary":
		_is_walk_expr(e["operand"], typed, decls, ctx, diags)
		return
	if kind == "call":
		_is_walk_expr(e["callee"], typed, decls, ctx, diags)
		for a in e["args"]:
			_is_walk_expr(a, typed, decls, ctx, diags)
		return
	if kind == "attribute":
		_is_walk_expr(e["obj"], typed, decls, ctx, diags)
		return
	if kind == "array":
		for it in e["items"]:
			_is_walk_expr(it, typed, decls, ctx, diags)
		return
	if kind == "dict":
		for en in e["entries"]:
			_is_walk_expr(en["key"], typed, decls, ctx, diags)
			_is_walk_expr(en["value"], typed, decls, ctx, diags)
		return
	if kind == "await":
		_is_walk_expr(e["operand"], typed, decls, ctx, diags)
		return
	if kind == "lambda":
		var ltyped = typed.duplicate()
		var ldecls = decls.duplicate()
		for p in e["params"]:
			if p.get("type") == null or p["type"].get("kind") != "named":
				continue
			_seed_into(ltyped, ldecls, p["name"], p["type"]["name"])
		_is_walk_stmts(e["body"], ltyped, ldecls, ctx, diags)
		return


static func _seed_into(typed, decls, name, type_name):
	var scalar = FC.scalar_static_name(type_name)
	if scalar != null:
		decls[name] = scalar
	var pos = _positional_slot(type_name, null)
	if pos != null:
		pos["ann"] = type_name
		typed[name] = pos
	var ds = SL.dict_slot_of(type_name)
	if ds != null:
		ds["ann"] = type_name
		typed[name] = ds


static func _is_walk_stmts(stmts, typed, decls, ctx, diags):
	for s in stmts:
		var kind = s.get("kind")
		if kind == "var":
			if s.get("type") != null and s["type"].get("kind") == "named":
				var slot = AS.parse_typed(s["type"]["name"])
				if slot != null:
					slot["ann"] = s["type"]["name"]
					typed[s["name"]] = slot
				else:
					var scalar = FC.scalar_static_name(s["type"]["name"])
					if scalar != null:
						decls[s["name"]] = scalar
					var pos = _positional_slot(s["type"]["name"], null)
					if pos != null:
						pos["ann"] = s["type"]["name"]
						typed[s["name"]] = pos
					var ds = SL.dict_slot_of(s["type"]["name"])
					if ds != null:
						ds["ann"] = s["type"]["name"]
						typed[s["name"]] = ds
			elif s.get("type") == null:
				var pos2 = _positional_slot(null, s.get("init"))
				if pos2 != null:
					typed[s["name"]] = pos2
				var init = s.get("init")
				if init != null and init.get("kind") == "call" and init["callee"].get("kind") == "ident" and (init["callee"].get("name") == "Vector4" or init["callee"].get("name") == "Vector4i"):
					decls[s["name"]] = init["callee"]["name"]
			if s.get("init") != null:
				_is_walk_expr(s["init"], typed, decls, ctx, diags)
			continue
		if kind == "assign":
			var handled = false
			if s["target"].get("kind") == "index" and s["target"]["obj"].get("kind") == "ident":
				var slot2 = typed.get(s["target"]["obj"]["name"])
				if slot2 != null:
					handled = true
					var r = AS.get_run()
					_bad_key(diags, slot2, s["target"]["index"], decls, ctx)
					if slot2["kind"] == "Dictionary" and _st_of(s["target"]["index"], decls, ctx) == "int":
						r["dictIntReads"].erase(AS.di_key(r, s["target"]["loc"]["line"], s["target"]["loc"]["col"]))
					var val_kind = slot2.get("elem") if slot2["kind"] == "Array" else slot2.get("val")
					if val_kind != null:
						_value_msg(diags, val_kind, s["value"], s["target"]["index"], decls, ctx, slot2["kind"] == "Dictionary")
			if not handled:
				_is_walk_expr(s["target"], typed, decls, ctx, diags)
			_is_walk_expr(s["value"], typed, decls, ctx, diags)
			continue
		if kind == "expr":
			_is_walk_expr(s["expr"], typed, decls, ctx, diags)
			continue
		if kind == "return":
			if s.get("value") != null:
				_is_walk_expr(s["value"], typed, decls, ctx, diags)
			continue
		if kind == "if":
			for b in s["branches"]:
				if b.get("cond") != null:
					_is_walk_expr(b["cond"], typed, decls, ctx, diags)
				_is_walk_stmts(b["body"], typed, decls, ctx, diags)
			continue
		if kind == "for":
			_is_walk_expr(s["iter"], typed, decls, ctx, diags)
			_is_walk_stmts(s["body"], typed, decls, ctx, diags)
			continue
		if kind == "while":
			_is_walk_expr(s["cond"], typed, decls, ctx, diags)
			_is_walk_stmts(s["body"], typed, decls, ctx, diags)
			continue
		if kind == "match":
			_is_walk_expr(s["subject"], typed, decls, ctx, diags)
			for arm in s["arms"]:
				if arm.get("guard") != null:
					_is_walk_expr(arm["guard"], typed, decls, ctx, diags)
				_is_walk_stmts(arm["body"], typed, decls, ctx, diags)
			continue


static func _scope_of(seeds, params, ret, ctx):
	var typed = {}
	var decls = {}
	if ret != null and ret.get("kind") == "named":
		_seed_into(typed, decls, "self", ret["name"])
	for p in seeds:
		if p.get("type") == null or p["type"].get("kind") != "named":
			continue
		_seed_into(typed, decls, p["name"], p["type"]["name"])
	for p in params:
		if p.get("type") == null or p["type"].get("kind") != "named":
			continue
		_seed_into(typed, decls, p["name"], p["type"]["name"])
	return {"typed": typed, "decls": decls}


static func _seed_list(vars_list):
	var out = []
	for v in vars_list:
		out.append({"name": v["name"], "type": v.get("type")})
	return out


static func check_typed_index_slots(m, diags):
	var module_seeds = _seed_list(m["vars"])
	var bodies = []
	for f in m["funcs"]:
		bodies.append({"stmts": f["body"], "params": f["params"], "seeds": module_seeds, "ret": f.get("returnType")})
	_index_classes(m["innerClasses"], module_seeds, bodies)
	var inits = []
	for v in m["vars"]:
		if v.get("init") != null:
			inits.append({"expr": v["init"], "seeds": module_seeds})
	_index_inits(m["innerClasses"], module_seeds, inits)
	var script_names = {}
	_index_script_names(m["innerClasses"], script_names)
	var ctx = {"scriptNames": script_names, "funcs": m["funcs"]}
	for b in bodies:
		var sc = _scope_of(b["seeds"], b["params"], b["ret"], ctx)
		_is_walk_stmts(b["stmts"], sc["typed"], sc["decls"], ctx, diags)
	for it in inits:
		var sc2 = _scope_of(it["seeds"], [], null, ctx)
		_is_walk_expr(it["expr"], sc2["typed"], sc2["decls"], ctx, diags)


static func _index_classes(list, module_seeds, bodies):
	for c in list:
		var fields = module_seeds.duplicate()
		for v in c["vars"]:
			fields.append({"name": v["name"], "type": v.get("type")})
		for f in c["funcs"]:
			bodies.append({"stmts": f["body"], "params": f["params"], "seeds": fields, "ret": f.get("returnType")})
		_index_classes(c["innerClasses"], module_seeds, bodies)


static func _index_inits(list, module_seeds, inits):
	for c in list:
		var fields = module_seeds.duplicate()
		for v in c["vars"]:
			fields.append({"name": v["name"], "type": v.get("type")})
		for v in c["vars"]:
			if v.get("init") != null:
				inits.append({"expr": v["init"], "seeds": fields})
		_index_inits(c["innerClasses"], module_seeds, inits)


static func _index_script_names(list, out):
	for c in list:
		var base = c.get("extends")
		out[c["name"]] = "" if base == null else base
		_index_script_names(c["innerClasses"], out)
