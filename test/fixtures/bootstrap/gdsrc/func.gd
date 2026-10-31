const AB = preload("res://abi.gd")
const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")
const LAY = preload("res://layout.gd")


static func emit_param_slots(f):
	var out = []
	var n = 0
	for p in f["params"]:
		n += 1
		var slot = AB.slot_type_name(p.get("type"))
		if slot == null:
			continue
		out.append(p["name"] + " = rt.paramSlot(" + p["name"] + ", " + JSON.stringify(slot) + ", " + str(n) + ", " + JSON.stringify(f["name"]) + ", this);")
	return out


static func frame_stmt_lines(loc):
	if loc == null:
		return []
	return ["rt.frameLine(" + str(loc["line"]) + ");"]

static func emit_param_list(params, abi_params = null):
	var out = []
	for i in params.size():
		var p = params[i]
		if p.get("default") == null and abi_params != null:
			var k = abi_params[i] if abi_params.size() > i else null
			if k != null:
				out.append(p["name"] + (": string" if k == "str" else ": number"))
				continue
		if p.get("default") == null:
			out.append(p["name"] + ": rt.Variant")
			continue
		var raw = load("res://expr_boxed.gd").emit_expr(p["default"])
		var init = p["default"]
		var from_literal = init.get("kind") == "array" or init.get("kind") == "dict"
		var stamped = HE.stamp_decl(p.get("type"), raw, true, from_literal)
		var cast = AB.declared_cast(p.get("type"))
		if cast == null:
			out.append(p["name"] + ": rt.Variant = " + stamped)
		else:
			out.append(p["name"] + ": rt.Variant = " + cast + "(" + stamped + ")")
	return ", ".join(out)


static func emit_func(f, base = 0):
	var c = CTX.ctx
	var saved_local = c["LOCAL_TYPES"]
	var saved_binds = c["FUNC_BINDS"]
	var saved_untyped = c["UNTYPED_NAMES"]
	var untyped = []
	c["LOCAL_TYPES"] = LAY.collect_local_types(f["body"], c["VAR_TYPES"].duplicate(), untyped)
	c["FUNC_BINDS"] = AB.collect_binds(f["body"], AB.seed_param_binds(f["params"]))
	for p in f["params"]:
		if p.get("type") == null or (p["type"].get("kind") == "named" and p["type"]["name"] == "Variant"):
			untyped.append(p["name"])
	var unset = {}
	for n in untyped:
		unset[n] = true
	c["UNTYPED_NAMES"] = unset
	var out = emit_func_inner(f, base)
	c["LOCAL_TYPES"] = saved_local
	c["FUNC_BINDS"] = saved_binds
	c["UNTYPED_NAMES"] = saved_untyped
	return out


static func emit_func_inner(f, base = 0):
	var c = CTX.ctx
	var prelude = {"rt": true}
	for n in HE.HOST_PRINT_NAMES:
		prelude[n] = true
	var shadowed = null
	for p in f["params"]:
		if prelude.has(p["name"]):
			shadowed = p["name"]
			break
	if shadowed == null:
		for n in c["LOCAL_TYPES"]:
			if prelude.has(n):
				shadowed = n
				break
	if shadowed == null:
		for n2 in c["UNTYPED_NAMES"]:
			if prelude.has(n2):
				shadowed = n2
				break
	if shadowed != null:
		return err("emit-prelude-shadow", shadowed + " 撞上发射器自己引进来的名字（rt 与 print 那一族）：产物里函数体会把它盖住，换掉这个名字")
	if f.get("isStatic") == true and (f["name"] == "_init" or f["name"] == "_initialize" or f["name"] == "_process"):
		return err("static-entry", "静态的 " + f["name"] + "() 还没实测过行为，不猜着发")
	if f["name"] == "_init":
		var INIT = load("res://init.gd")
		if c["INIT_AS_METHOD"]:
			return INIT.emit_init_method(f, base)
		return INIT.emit_init_as_constructor(f, base, c["NEEDS_HOST_SUPER"])
	var is_entry = f["name"] == "_initialize" or f["name"] == "_process"
	var abi = c["RAW_ABIS"].get(f["name"])
	var wrap = is_entry and abi == null
	var body_name = "__gd_" + f["name"] if wrap else f["name"]
	var async = "async " if (f.get("coroutine") == true or is_entry) else ""
	var params = emit_param_list(f["params"], null if abi == null else abi["params"])
	var has_value = HE.has_value_return(f["body"])
	var ret = ""
	if abi != null:
		ret = "string" if abi["ret"] == "str" else "number"
	elif f["name"] == "_initialize":
		ret = "Promise<void>"
	elif is_entry or f.get("coroutine") == true:
		ret = "Promise<unknown>"
	else:
		ret = "rt.Variant" if has_value else "void"
	var lines = []
	if wrap:
		var fwd_parts = []
		for p2 in f["params"]:
			fwd_parts.append(p2["name"])
		var fwd = ", ".join(fwd_parts)
		var dname = "delta"
		if f["params"].size() > 0:
			dname = f["params"][0]["name"]
		var wrap_params = (dname + ": number") if f["name"] == "_process" else params
		var wrap_fwd = "rt.V.float(" + dname + ")" if f["name"] == "_process" else fwd
		var override1 = "override " if c["INHERITED_METHODS"].has(f["name"]) else ""
		lines.append("  " + override1 + f["name"] + "(" + wrap_params + "): " + ret + " { return this." + body_name + "(" + wrap_fwd + "); }")
	var overriding = false
	if f.get("isStatic") != true:
		if wrap:
			overriding = c["SCRIPT_INHERITED"].has(f["name"])
		else:
			overriding = c["INHERITED_METHODS"].has(f["name"])
	var head = ""
	if f.get("isStatic") == true:
		head = "static "
	if overriding:
		head = head + "override "
	lines.append(head + async + body_name + "(" + params + "): " + ret + " {")
	HE.mark(base, f.get("loc"))
	var saved_unboxed = c["UNBOXED"]
	var saved_ret = c["CURRENT_RET"]
	var saved_arrays = c["RAW_ARRAYS"]
	var saved_dicts = c["RAW_DICTS"]
	var saved_func = c["CURRENT_FUNC"]
	c["CURRENT_FUNC"] = f["name"]
	var catch_ret = null
	if abi == null:
		if ret == "void" or ret == "Promise<void>":
			catch_ret = "return;"
		else:
			catch_ret = "return " + HE.type_default(f.get("returnType")) + ";"
	c["CURRENT_RET"] = null if abi == null else abi["ret"]
	var saved_ret_ann = c["CURRENT_RET_ANN"]
	c["CURRENT_RET_ANN"] = f.get("returnType")
	var layout = HE.analyze_func_layout(f)
	c["UNBOXED"] = layout["unboxed"]
	c["RAW_ARRAYS"] = layout["arrays"]
	c["RAW_DICTS"] = layout["dicts"]
	var pad = "    "
	for l in HE.frame_enter_lines(f["name"]):
		lines.append(l)
	if f.get("isStatic") != true:
		for l2 in emit_param_slots(f):
			lines.append(pad + l2)
	var ES = load("res://emit_stmt.gd")
	for s in f["body"]:
		HE.mark(base + lines.size(), s.get("loc"))
		for l3 in ES.emit_stmt(s, f["name"] == "_initialize"):
			lines.append(pad + l3)
	c["UNBOXED"] = saved_unboxed
	c["CURRENT_RET"] = saved_ret
	c["CURRENT_RET_ANN"] = saved_ret_ann
	c["RAW_ARRAYS"] = saved_arrays
	c["RAW_DICTS"] = saved_dicts
	c["CURRENT_FUNC"] = saved_func
	for l4 in HE.frame_exit_lines(catch_ret):
		lines.append(l4)
	if ret == "rt.Variant":
		lines.append(pad + "return rt.V.nil();")
	lines.append("}")
	lines.append("")
	return lines


static func err(code, message):
	return {"__error": code, "message": message}
