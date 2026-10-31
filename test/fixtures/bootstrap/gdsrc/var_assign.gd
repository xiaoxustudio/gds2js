const SL = preload("res://slots.gd")
const FC = preload("res://faces.gd")


static func _scalar_type(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	var open = name.find("[")
	var base = name if open < 0 else name.substr(0, open)
	if base == "int" or base == "float" or base == "bool" or base == "String" or base == "StringName":
		return base
	if FC.static_value_type(base):
		return base
	return null


static func _static_of(e, d):
	if e.get("kind") == "ident":
		var t = d.get(e["name"])
		return t
	return SL.slot_source(e)


static func _decl_refuse(diags, name, slot, init, slots):
	var st = _static_of(init, slots)
	if st == null or SL.var_slot_holds(slot, st) != false:
		return
	diags.append({"code": "typed-var-value", "message": "Cannot assign a value of type \"" + st + "\" as \"" + slot + "\".", "loc": init["loc"]})
	diags.append({"code": "typed-var-assign", "message": "Cannot assign a value of type " + st + " to variable \"" + name + "\" with specified type " + slot + ".", "loc": init["loc"]})


static func _check_body(diags, body, outer):
	var decls = outer.duplicate()
	for s in body:
		var kind = s.get("kind")
		if kind == "var":
			var d = _scalar_type(s.get("type"))
			if d != null:
				decls[s["name"]] = d
			if d != null and s.get("init") != null:
				_decl_refuse(diags, s["name"], d, s["init"], decls)
			if s.get("init") != null:
				_expr(diags, s["init"], decls)
		elif kind == "assign":
			if s["target"].get("kind") == "ident":
				var slot = decls.get(s["target"]["name"])
				var st = _static_of(s["value"], decls)
				if slot != null and st != null:
					if SL.var_slot_holds(slot, st) == false:
						var value = s["value"]
						if value.get("kind") == "lit" or (FC.static_type(value) != null and FC.static_value_type(st)):
							diags.append({"code": "typed-var-value", "message": "Cannot assign a value of type \"" + st + "\" as \"" + slot + "\".", "loc": value["loc"]})
						diags.append({"code": "typed-var-assign", "message": "Value of type \"" + st + "\" cannot be assigned to a variable of type \"" + slot + "\".", "loc": value["loc"]})
			_expr(diags, s["value"], decls)
		elif kind == "if":
			for br in s["branches"]:
				if br.get("cond") != null:
					_expr(diags, br["cond"], decls)
				_check_body(diags, br["body"], decls)
		elif kind == "for":
			_expr(diags, s["iter"], decls)
			_check_body(diags, s["body"], decls)
		elif kind == "while":
			_expr(diags, s["cond"], decls)
			_check_body(diags, s["body"], decls)
		elif kind == "match":
			_expr(diags, s["subject"], decls)
			for arm in s["arms"]:
				if arm.get("guard") != null:
					_expr(diags, arm["guard"], decls)
				_check_body(diags, arm["body"], decls)
		elif kind == "expr":
			_expr(diags, s["expr"], decls)
		elif kind == "return":
			if s.get("value") != null:
				_expr(diags, s["value"], decls)


static func _expr(diags, e, decls):
	var kind = e.get("kind")
	if kind == "lambda":
		_check_body(diags, e["body"], decls)
		return
	if kind == "call":
		if e["callee"].get("kind") == "ident" and e["callee"].get("name") == "is_instance_of":
			var msg = SL.instance_of_type_arg_message(e)
			if msg != null:
				diags.append({"code": "instance-of-type-arg", "message": msg, "loc": e["loc"]})
		_expr(diags, e["callee"], decls)
		for a in e["args"]:
			_expr(diags, a, decls)
		return
	if kind == "binary":
		_expr(diags, e["left"], decls)
		_expr(diags, e["right"], decls)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_expr(diags, e["operand"], decls)
		return
	if kind == "attribute":
		_expr(diags, e["obj"], decls)
		return
	if kind == "index":
		_expr(diags, e["obj"], decls)
		_expr(diags, e["index"], decls)
		return
	if kind == "array":
		for it in e["items"]:
			_expr(diags, it, decls)
		return
	if kind == "dict":
		for en in e["entries"]:
			_expr(diags, en["key"], decls)
			_expr(diags, en["value"], decls)
		return


static func _run(diags, vars, funcs):
	var outer = {}
	for v in vars:
		var d = _scalar_type(v.get("type"))
		if d != null:
			outer[v["name"]] = d
	for v in vars:
		var d = _scalar_type(v.get("type"))
		if d != null and v.get("init") != null:
			_decl_refuse(diags, v["name"], d, v["init"], outer)
	for f in funcs:
		_check_body(diags, f["body"], outer)


static func check_typed_var_assign(m, diags):
	_run(diags, m["vars"], m["funcs"])
	_classes(diags, m["innerClasses"])


static func _classes(diags, list):
	for c in list:
		_run(diags, c["vars"], c["funcs"])
		_classes(diags, c["innerClasses"])
