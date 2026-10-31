const WK = preload("res://walk.gd")
const FC = preload("res://faces.gd")
const SL = preload("res://slots.gd")
const GLOB = preload("res://globals.gd")
const CA = preload("res://calls.gd")
const AS = preload("res://analyze_state.gd")


static func _one(diags, vars, funcs):
	var own = {}
	for f in funcs:
		if not own.has(f["name"]):
			own[f["name"]] = f
	for v in vars:
		var a = v.get("accessor")
		if a == null:
			continue
		if a.get("getter") != null and a["getter"].get("kind") == "method":
			_judge(diags, v, own, "Getter", "getter", a["getter"]["method"])
		if a.get("setter") != null and a["setter"].get("kind") == "method":
			_judge(diags, v, own, "Setter", "setter", a["setter"]["method"])


static func _judge(diags, v, own, word, kind, name):
	if not own.has(name):
		diags.append({"code": "property-delegate", "message": word + " \"" + name + "\" not found.", "loc": v["loc"]})
		return
	var f = own[name]
	var want = 0 if kind == "getter" else 1
	if f["params"].size() != want:
		diags.append({"code": "property-delegate", "message": "Function \"" + name + "\" cannot be used as " + kind + " because of its signature.", "loc": v["loc"]})
		return
	for p in f["params"]:
		if p.get("default") != null:
			diags.append({"code": "property-delegate", "message": "Function \"" + name + "\" cannot be used as " + kind + " because of its signature.", "loc": v["loc"]})
			return


static func check_property_delegates(m, diags):
	_one(diags, m["vars"], m["funcs"])
	_classes(diags, m["innerClasses"])


static func _classes(diags, list):
	for c in list:
		_one(diags, c["vars"], c["funcs"])
		_classes(diags, c["innerClasses"])


static func check_return_paths(funcs, diags):
	for f in funcs:
		var ret = f.get("returnType")
		if ret == null:
			continue
		if ret.get("kind") == "named" and ret.get("name") == "void":
			continue
		if WK.guaranteed_return(f["body"]):
			continue
		diags.append({"code": "return-path", "message": "Not all code paths return a value.", "loc": f["loc"]})


static func _strip(name):
	var open = name.find("[")
	return name if open < 0 else name.substr(0, open)


static func _param_slot(t):
	if t == null or t.get("kind") != "named":
		return null
	var base = _strip(t["name"])
	if base == "int" or base == "float" or base == "bool" or base == "String" or base == "StringName":
		return base
	if FC.is_param_own_slot(base):
		return base
	return base if FC.static_value_type(base) else null


static func _param_source(e):
	var st = SL.slot_source(e)
	if st != null:
		return st
	if e.get("kind") == "lit" and e.get("lit") == "node_path":
		return "NodePath"
	return null


static func _check_params(params, diags):
	for p in params:
		var slot = _param_slot(p.get("type"))
		var def = p.get("default")
		if slot == null or def == null:
			continue
		var st = _param_source(def)
		if st == null:
			continue
		if FC.holds_param_default(slot, st):
			continue
		if st != "Array" and st != "Dictionary":
			diags.append({"code": "param-default-value", "message": "Cannot assign a value of type \"" + st + "\" as \"" + slot + "\".", "loc": def["loc"]})
		diags.append({"code": "param-default-assign", "message": "Cannot assign a value of type " + st + " to parameter \"" + p["name"] + "\" with specified type " + slot + ".", "loc": def["loc"]})


static func _lambdas(n, diags):
	if n is Array:
		for x in n:
			_lambdas(x, diags)
		return
	if not (n is Dictionary):
		return
	if n.get("kind") == "lambda":
		_check_params(n.get("params", []), diags)
	for k in n.keys():
		if k != "loc":
			_lambdas(n[k], diags)


static func check_param_default_assign(m, diags):
	for f in m["funcs"]:
		_check_params(f["params"], diags)
	_param_classes(m["innerClasses"], diags)
	_lambdas(m, diags)


static func _param_classes(list, diags):
	for c in list:
		for f in c["funcs"]:
			_check_params(f["params"], diags)
		_param_classes(c["innerClasses"], diags)


static func check_signal_defaults(m, diags):
	var found = []
	for s in m["signals"]:
		if s.get("hasDefaults"):
			found.append(s)
	for c in m["innerClasses"]:
		_collect_signals(c, found)
	if found.is_empty():
		return
	var first = found[0]
	for s in found:
		if s["loc"]["line"] < first["loc"]["line"]:
			first = s
	diags.append({"code": "signal-default-param", "message": "Signal parameters cannot have a default value.", "loc": first["loc"]})


static func _collect_signals(c, found):
	for s in c["signals"]:
		if s.get("hasDefaults"):
			found.append(s)
	for inner in c["innerClasses"]:
		_collect_signals(inner, found)

static func _slot_names(c, names):
	names[c["name"]] = true
	for inner in c["innerClasses"]:
		_slot_names(inner, names)


static func _sc_slot_of(t, names):
	if t == null or t.get("kind") != "named":
		return null
	if names.has(t["name"]):
		return t["name"]
	return null


static func _sc_refuse(diags, name, kind, slot, init, loc):
	if init == null:
		return
	var st = SL.slot_source(init)
	if st == null or st == "null":
		return
	diags.append({"code": "script-class-slot", "message": "Cannot assign a value of type " + st + " to " + kind + " \"" + name + "\" with specified type " + slot + ".", "loc": loc})


static func _sc_var_slot(diags, names, v):
	var slot = _sc_slot_of(v.get("type"), names)
	if slot != null:
		_sc_refuse(diags, v["name"], "variable", slot, v.get("init"), v["loc"])


static func _sc_param_slots(diags, names, f):
	for p in f["params"]:
		var slot = _sc_slot_of(p.get("type"), names)
		if slot != null:
			_sc_refuse(diags, p["name"], "parameter", slot, p.get("default"), f["loc"])


static func _sc_class_vars(diags, names, c):
	for v in c["vars"]:
		_sc_var_slot(diags, names, v)
	for inner in c["innerClasses"]:
		_sc_class_vars(diags, names, inner)


static func _sc_class_funcs(diags, names, c):
	for f in c["funcs"]:
		_sc_param_slots(diags, names, f)
		_sc_stmt_vars(diags, names, f["body"])
	for inner in c["innerClasses"]:
		_sc_class_funcs(diags, names, inner)


static func _sc_stmt_vars(diags, names, n):
	if n is Array:
		for x in n:
			_sc_stmt_vars(diags, names, x)
		return
	if not (n is Dictionary):
		return
	if n.get("kind") == "var":
		var slot = _sc_slot_of(n.get("type"), names)
		if slot != null and n.get("name") != null:
			_sc_refuse(diags, n["name"], "variable", slot, n.get("init"), n.get("loc"))
	for k in n.keys():
		if k == "loc":
			continue
		_sc_stmt_vars(diags, names, n[k])


static func check_script_class_slots(m, diags):
	var names = {}
	for c in m["innerClasses"]:
		_slot_names(c, names)
	if names.is_empty():
		return
	for v in m["vars"]:
		_sc_var_slot(diags, names, v)
	for f in m["funcs"]:
		_sc_param_slots(diags, names, f)
	for c in m["innerClasses"]:
		_sc_class_vars(diags, names, c)
	for f in m["funcs"]:
		_sc_stmt_vars(diags, names, f["body"])
	for c in m["innerClasses"]:
		_sc_class_funcs(diags, names, c)

static func _ca_expr_bindings(e, rebound, local_consts):
	if e == null:
		return
	var kind = e.get("kind")
	if kind == "lambda":
		for p in e["params"]:
			rebound[p["name"]] = true
		_ca_bindings(e["body"], rebound, local_consts)
		return
	if kind == "binary":
		_ca_expr_bindings(e["left"], rebound, local_consts)
		_ca_expr_bindings(e["right"], rebound, local_consts)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_ca_expr_bindings(e["operand"], rebound, local_consts)
		return
	if kind == "index":
		_ca_expr_bindings(e["obj"], rebound, local_consts)
		_ca_expr_bindings(e["index"], rebound, local_consts)
		return
	if kind == "attribute":
		_ca_expr_bindings(e["obj"], rebound, local_consts)
		return
	if kind == "array":
		for it in e["items"]:
			_ca_expr_bindings(it, rebound, local_consts)
		return
	if kind == "dict":
		for en in e["entries"]:
			_ca_expr_bindings(en["key"], rebound, local_consts)
			_ca_expr_bindings(en["value"], rebound, local_consts)
		return


static func _ca_bindings(ss, rebound, local_consts):
	for s in ss:
		var kind = s.get("kind")
		if kind == "var":
			if s.get("isConst") == true:
				local_consts[s["name"]] = true
			else:
				rebound[s["name"]] = true
			_ca_expr_bindings(s.get("init"), rebound, local_consts)
		elif kind == "assign":
			_ca_expr_bindings(s["target"], rebound, local_consts)
			_ca_expr_bindings(s["value"], rebound, local_consts)
		elif kind == "for":
			rebound[s["var"]] = true
			_ca_expr_bindings(s["iter"], rebound, local_consts)
			_ca_bindings(s["body"], rebound, local_consts)
		elif kind == "if":
			for b in s["branches"]:
				if b.get("cond") != null:
					_ca_expr_bindings(b["cond"], rebound, local_consts)
				_ca_bindings(b["body"], rebound, local_consts)
		elif kind == "while":
			_ca_expr_bindings(s["cond"], rebound, local_consts)
			_ca_bindings(s["body"], rebound, local_consts)
		elif kind == "match":
			_ca_expr_bindings(s["subject"], rebound, local_consts)
			for arm in s["arms"]:
				for n in WK.pattern_bindings(arm["pattern"]):
					rebound[n] = true
				if arm.get("guard") != null:
					_ca_expr_bindings(arm["guard"], rebound, local_consts)
				_ca_bindings(arm["body"], rebound, local_consts)
		elif kind == "expr":
			_ca_expr_bindings(s["expr"], rebound, local_consts)
		elif kind == "return":
			if s.get("value") != null:
				_ca_expr_bindings(s["value"], rebound, local_consts)


static func _ca_check(diags, ss, consts, rebound, names):
	for s in ss:
		var kind = s.get("kind")
		if kind == "assign":
			if s["target"].get("kind") == "ident":
				var nm = s["target"]["name"]
				if not rebound.has(nm) and (consts.has(nm) or GLOB.is_global_const(nm) or GLOB.is_global_value(nm) or GLOB.is_engine_class(nm) or names.has(nm)):
					diags.append({"code": "const-assign", "message": "Cannot assign a new value to a constant.", "loc": s["loc"]})
			var v = s["value"]
			if v.get("kind") == "lambda":
				_ca_check(diags, v["body"], consts, rebound, names)
		elif kind == "var":
			var init = s.get("init")
			if init != null and init.get("kind") == "lambda":
				_ca_check(diags, init["body"], consts, rebound, names)
		elif kind == "if":
			for b in s["branches"]:
				_ca_check(diags, b["body"], consts, rebound, names)
		elif kind == "while" or kind == "for":
			_ca_check(diags, s["body"], consts, rebound, names)
		elif kind == "match":
			for arm in s["arms"]:
				_ca_check(diags, arm["body"], consts, rebound, names)
		elif kind == "expr":
			if s["expr"].get("kind") == "lambda":
				_ca_check(diags, s["expr"]["body"], consts, rebound, names)


static func _ca_one(diags, params, body, consts, names):
	var rebound = {}
	for p in params:
		rebound[p["name"]] = true
	var local_consts = {}
	_ca_bindings(body, rebound, local_consts)
	var all = consts.duplicate()
	for k in local_consts:
		all[k] = true
	_ca_check(diags, body, all, rebound, names)


static func _ca_accessors(diags, list, consts, face):
	for v in list:
		var acc = v.get("accessor")
		if acc == null or v.get("isStatic") == true:
			continue
		var getter = acc.get("getter")
		if getter != null and getter.get("kind") == "inline":
			_ca_one(diags, [], getter["body"], consts, face)
		var setter = acc.get("setter")
		if setter != null and setter.get("kind") == "inline":
			_ca_one(diags, [{"name": setter["param"], "type": null, "default": null}], setter["body"], consts, face)


static func _ca_class(diags, c, inherited):
	var consts = inherited.duplicate()
	for v in c["vars"]:
		if v.get("isConst") == true:
			consts[v["name"]] = true
	for f in c["funcs"]:
		_ca_one(diags, f["params"], f["body"], consts, {})
	_ca_accessors(diags, c["vars"], consts, {})
	for inner in c["innerClasses"]:
		_ca_class(diags, inner, consts)


static func check_const_assign(m, diags, host_face):
	var module_consts = {}
	for v in m["vars"]:
		if v.get("isConst") == true:
			module_consts[v["name"]] = true
	for f in m["funcs"]:
		var face = {} if f.get("isStatic") == true else host_face
		_ca_one(diags, f["params"], f["body"], module_consts, face)
	_ca_accessors(diags, m["vars"], module_consts, host_face)
	for c in m["innerClasses"]:
		_ca_class(diags, c, module_consts)

static func _ic_scan(node, out):
	if node is Array:
		for x in node:
			_ic_scan(x, out)
		return
	if not (node is Dictionary):
		return
	if node.get("kind") == "lambda":
		return
	out.append(node)
	for k in node.keys():
		if k == "loc":
			continue
		_ic_scan(node[k], out)


static func _ic_arity_text(who, params, got):
	var max_n = params.size()
	var min_n = 0
	for p in params:
		if p.get("default") == null:
			min_n += 1
	if got > max_n:
		return "Too many arguments for \"" + who + "()\" call. Expected at most " + str(max_n) + " but received " + str(got) + "."
	if got < min_n:
		return "Too few arguments for \"" + who + "()\" call. Expected at least " + str(min_n) + " but received " + str(got) + "."
	return null


static func _ic_call_shape(e) -> Variant:
	var callee = e.get("callee")
	if callee == null:
		return null
	var args = e.get("args")
	var count = args.size() if args != null else 0
	if callee.get("kind") == "ident" and callee.get("name") == "super":
		return {"kind": "super", "target": "super", "args": count}
	if callee.get("kind") == "attribute" and callee.get("name") == "new" and callee["obj"].get("kind") == "ident":
		return {"kind": "new", "target": callee["obj"]["name"], "args": count}
	return null


static func _ic_index(inner, list):
	for c in list:
		inner[c["name"]] = c
		_ic_index(inner, c["innerClasses"])


static func _ic_chain(inner, globals, start) -> Dictionary:
	var seen = {}
	var name = start
	while name != null:
		if seen.has(name):
			return {"state": "unknown"}
		seen[name] = true
		var c = inner.get(name)
		if c == null:
			if globals.has(name):
				return {"state": "unknown"}
			return {"state": "none"}
		var found = null
		for x in c["funcs"]:
			if x["name"] == "_init" and x.get("isStatic") != true:
				found = x
				break
		if found != null:
			return {"state": "init", "params": found["params"]}
		name = c.get("extends")
	return {"state": "none"}


static func check_init_contracts(m, globals, diags):
	var inner = {}
	_ic_index(inner, m["innerClasses"])
	var funcs = []
	for f in m["funcs"]:
		funcs.append({"f": f, "owner": null})
	_ic_collect(funcs, m["innerClasses"])
	for item in funcs:
		var f = item["f"]
		var owner = item["owner"]
		var is_init = f["name"] == "_init" and f.get("isStatic") != true
		var nodes = []
		_ic_scan(f["body"], nodes)
		if is_init:
			for e in nodes:
				if e.get("kind") == "return" and e.get("value") != null:
					diags.append({"code": "init-returns-value", "message": "Constructor cannot return a value.", "loc": e["loc"]})
		for e in nodes:
			if e.get("kind") != "call":
				continue
			var shape = _ic_call_shape(e)
			if shape == null:
				continue
			if shape["kind"] == "super":
				if not is_init or owner == null:
					continue
				var up = _ic_chain(inner, globals, owner.get("extends"))
				if up["state"] == "unknown":
					continue
				if up["state"] == "none":
					diags.append({
						"code": "super-init-missing",
						"message": "Cannot call the parent class' virtual function \"_init()\" because it hasn't been defined.",
						"loc": e["loc"],
					})
					continue
				var text = _ic_arity_text("_init", up["params"], shape["args"])
				if text != null:
					diags.append({"code": "super-init-arity", "message": text, "loc": e["loc"]})
				continue
			if not inner.has(shape["target"]):
				continue
			var target = _ic_chain(inner, globals, shape["target"])
			if target["state"] != "init":
				continue
			var text2 = _ic_arity_text("new", target["params"], shape["args"])
			if text2 != null:
				diags.append({"code": "new-arity", "message": text2, "loc": e["loc"]})


static func _ic_collect(funcs, list):
	for c in list:
		for f in c["funcs"]:
			funcs.append({"f": f, "owner": c})
		_ic_collect(funcs, c["innerClasses"])

static func _cfv_scan_expr(e, out):
	var kind = e.get("kind")
	if kind == "call":
		if e["callee"].get("kind") == "ident":
			out.append({"name": e["callee"]["name"], "loc": e["loc"]})
		_cfv_scan_expr(e["callee"], out)
		for a in e["args"]:
			_cfv_scan_expr(a, out)
		return
	if kind == "index":
		_cfv_scan_expr(e["obj"], out)
		_cfv_scan_expr(e["index"], out)
		return
	if kind == "attribute":
		_cfv_scan_expr(e["obj"], out)
		return
	if kind == "binary":
		_cfv_scan_expr(e["left"], out)
		_cfv_scan_expr(e["right"], out)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_cfv_scan_expr(e["operand"], out)
		return
	if kind == "array":
		for it in e["items"]:
			_cfv_scan_expr(it, out)
		return
	if kind == "dict":
		for en in e["entries"]:
			_cfv_scan_expr(en["key"], out)
			_cfv_scan_expr(en["value"], out)
		return
	if kind == "lambda":
		_cfv_scan_stmts(e["body"], out)
		return


static func _cfv_scan_stmts(body, out):
	for s in body:
		var kind = s.get("kind")
		if kind == "expr":
			_cfv_scan_expr(s["expr"], out)
		elif kind == "var":
			if s.get("init") != null:
				_cfv_scan_expr(s["init"], out)
		elif kind == "assign":
			_cfv_scan_expr(s["target"], out)
			_cfv_scan_expr(s["value"], out)
		elif kind == "if":
			for br in s["branches"]:
				if br.get("cond") != null:
					_cfv_scan_expr(br["cond"], out)
				_cfv_scan_stmts(br["body"], out)
		elif kind == "for":
			_cfv_scan_expr(s["iter"], out)
			_cfv_scan_stmts(s["body"], out)
		elif kind == "while":
			_cfv_scan_expr(s["cond"], out)
			_cfv_scan_stmts(s["body"], out)
		elif kind == "match":
			_cfv_scan_expr(s["subject"], out)
			for arm in s["arms"]:
				if arm.get("guard") != null:
					_cfv_scan_expr(arm["guard"], out)
				_cfv_scan_stmts(arm["body"], out)
		elif kind == "return":
			if s.get("value") != null:
				_cfv_scan_expr(s["value"], out)


static func _cfv_report(diags, outer, own, local, out):
	for hit in out:
		var name = hit["name"]
		if outer.has(name) and not own.has(name) and not local.has(name):
			diags.append({"code": "class-outer-func", "message": "Function \"" + name + "()\" not found in base self.", "loc": hit["loc"]})


static func _cfv_class(diags, outer, c):
	var own = {}
	for f in c["funcs"]:
		own[f["name"]] = true
	for f in c["funcs"]:
		var local = {}
		var params = []
		for p in f["params"]:
			params.append(p["name"])
		WK.collect_local_names(f["body"], params, local)
		var hits = []
		_cfv_scan_stmts(f["body"], hits)
		for p in f["params"]:
			if p.get("default") != null:
				_cfv_scan_expr(p["default"], hits)
		_cfv_report(diags, outer, own, local, hits)
	for v in c["vars"]:
		var local2 = {}
		var hits2 = []
		if v.get("init") != null:
			_cfv_scan_expr(v["init"], hits2)
		var a = v.get("accessor")
		if a != null:
			var getter = a.get("getter")
			if getter != null and getter.get("kind") == "inline":
				_cfv_scan_stmts(getter["body"], hits2)
			var setter = a.get("setter")
			if setter != null and setter.get("kind") == "inline":
				local2[setter["param"]] = true
				_cfv_scan_stmts(setter["body"], hits2)
		_cfv_report(diags, outer, own, local2, hits2)
	for inner in c["innerClasses"]:
		_cfv_class(diags, outer, inner)


static func check_class_func_visibility(m, diags):
	var outer = {}
	for f in m["funcs"]:
		outer[f["name"]] = true
	if outer.is_empty():
		return
	for c in m["innerClasses"]:
		_cfv_class(diags, outer, c)

static func check_field_inits(list, scope, coroutines, diags, face):
	var self_scope = scope.child([], true)
	var r = AS.get_run()
	for v in list:
		var prev_face = r["hostValueMethods"]
		var prev_ctx = r["hostStaticCtx"]
		r["hostValueMethods"] = face
		if v.get("isConst") == true:
			r["hostStaticCtx"] = {"kind": "const", "name": v["name"]}
		elif v.get("isStatic") == true:
			r["hostStaticCtx"] = {"kind": "var"}
		else:
			r["hostStaticCtx"] = null
		if v.get("init") != null:
			WK.walk_expr(v["init"], self_scope, coroutines, diags)
		var acc = v.get("accessor")
		if acc != null:
			var acc_scope = self_scope.child([], false) if v.get("isStatic") == true else self_scope
			if v.get("isStatic") == true:
				r["hostStaticCtx"] = {"kind": "func", "name": "@" + v["name"] + "_getter"}
			else:
				r["hostStaticCtx"] = null
			var getter = acc.get("getter")
			if getter != null and getter.get("kind") == "inline":
				WK.walk_stmts(getter["body"], acc_scope, coroutines, diags, false)
			if v.get("isStatic") == true:
				r["hostStaticCtx"] = {"kind": "func", "name": "@" + v["name"] + "_setter"}
			else:
				r["hostStaticCtx"] = null
			var setter = acc.get("setter")
			if setter != null and setter.get("kind") == "inline":
				WK.walk_stmts(setter["body"], acc_scope.child([setter["param"]]), coroutines, diags, false)
		r["hostValueMethods"] = prev_face
		r["hostStaticCtx"] = prev_ctx


static func check_class(c, base_scope, diags, classes):
	var names = [c["name"]]
	for n in AS.decl_names(c):
		names.append(n)
	for n in WK.inherited_names(c, classes):
		names.append(n)
	var scope = base_scope.child(names)
	var coroutines = {}
	for f in c["funcs"]:
		if f.get("coroutine") == true:
			coroutines[f["name"]] = true
	CA.check_static_access(c["funcs"], c["vars"], diags)
	for f in c["funcs"]:
		WK.check_func(f, scope, coroutines, diags)
	check_field_inits(c["vars"], scope, coroutines, diags, {})
	for inner in c["innerClasses"]:
		check_class(inner, scope, diags, classes)
