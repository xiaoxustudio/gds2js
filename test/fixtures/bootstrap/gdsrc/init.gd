const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")
const AB = preload("res://abi.gd")
const FN = preload("res://func.gd")


static func emit_init_method(f, base):
	var c = CTX.ctx
	var lines = []
	var prefix = "override " if c["INHERITED_METHODS"].has("_init") else ""
	lines.append(prefix + "_init(...__gd_init_args: rt.Variant[]): void {")
	var pad = "    "
	for l in HE.frame_enter_lines("_init"):
		lines.append(l)
	for i in f["params"].size():
		var p = f["params"][i]
		var got = "__gd_init_args[" + str(i) + "] as rt.Variant"
		var value = got
		if p.get("default") != null:
			var raw = load("res://expr_boxed.gd").emit_expr(p["default"])
			var init = p["default"]
			var from_literal = init.get("kind") == "array" or init.get("kind") == "dict"
			var stamped = HE.stamp_decl(p.get("type"), raw, true, from_literal)
			var cast = AB.declared_cast(p.get("type"))
			var dflt = stamped
			if cast != null:
				dflt = cast + "(" + stamped + ")"
			value = "__gd_init_args.length > " + str(i) + " ? (" + got + ") : (" + dflt + ")"
		var slot = AB.slot_type_name(p.get("type"))
		if slot != null:
			value = "rt.paramSlot(" + value + ", " + JSON.stringify(slot) + ", " + str(i + 1) + ", " + JSON.stringify(f["name"]) + ", this)"
		lines.append(pad + "const " + p["name"] + " = " + value + ";")
	HE.mark(base, f.get("loc"))
	var saved_in = c["IN_INIT"]
	var saved_unboxed = c["UNBOXED"]
	var saved_func = c["CURRENT_FUNC"]
	c["IN_INIT"] = true
	c["CURRENT_FUNC"] = "_init"
	c["UNBOXED"] = AB.compute_unboxed(f)
	var ES = load("res://emit_stmt.gd")
	for s in f["body"]:
		HE.mark(base + lines.size(), s.get("loc"))
		for l2 in ES.emit_stmt(s, false):
			lines.append(pad + l2)
	c["IN_INIT"] = saved_in
	c["UNBOXED"] = saved_unboxed
	c["CURRENT_FUNC"] = saved_func
	for l3 in HE.frame_exit_lines("return;"):
		lines.append(l3)
	lines.append("}")
	lines.append("")
	return lines


static func emit_init_as_constructor(f, base, host_super):
	var c = CTX.ctx
	var params = FN.emit_param_list(f["params"])
	var lines = ["constructor(" + params + ") {"]
	HE.mark(base, f.get("loc"))
	var explicit_super = false
	if f["body"].size() > 0:
		var first = f["body"][0]
		if first.get("kind") == "expr" and first["expr"].get("kind") == "call" and first["expr"]["callee"].get("kind") == "ident" and first["expr"]["callee"].get("name") == "super":
			explicit_super = true
	if not explicit_super and host_super:
		lines.append("  super();")
	lines.append("  this.__gd_fields__();")
	lines.append("  if (!rt.bareConstruction()) {")
	var pad = "      "
	for l in HE.frame_enter_lines("_init"):
		lines.append("    " + l)
	var saved_unboxed = c["UNBOXED"]
	var saved_func = c["CURRENT_FUNC"]
	c["UNBOXED"] = AB.compute_unboxed(f)
	c["CURRENT_FUNC"] = "_init"
	for l2 in FN.emit_param_slots(f):
		lines.append(pad + l2)
	var ES = load("res://emit_stmt.gd")
	for s in f["body"]:
		HE.mark(base + lines.size(), s.get("loc"))
		for l3 in ES.emit_stmt(s, false):
			lines.append(pad + l3)
	c["UNBOXED"] = saved_unboxed
	c["CURRENT_FUNC"] = saved_func
	for l4 in HE.frame_exit_lines("return;"):
		lines.append("    " + l4)
	lines.append("  }")
	lines.append("}")
	lines.append("")
	return lines
