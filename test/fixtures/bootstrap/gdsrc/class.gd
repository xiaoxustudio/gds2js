const AB = preload("res://abi.gd")
const LAY = preload("res://layout.gd")
const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")


static func emit_field_declarations(vars, signals):
	var out = []
	for s in signals:
		out.append("  declare " + s["name"] + ": rt.Signal;")
	for v in vars:
		if v.get("isStatic"):
			continue
		var slot = AB.prop_slot(v)
		if slot != null:
			out.append("  declare " + slot + ": rt.Variant;")
		if v.get("accessor") != null:
			continue
		out.append("  declare " + v["name"] + ": rt.Variant;")
	if not out.is_empty():
		out.append("")
	return out


static func emit_inner_mirrors(inner_classes):
	var out = []
	for c in inner_classes:
		out.append("  static " + c["name"] + ": typeof " + c["name"] + ";")
	if not out.is_empty():
		out.append("")
	return out


static func emit_dispatch(funcs, proto):
	var out = ["  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {"]
	out.append("    switch (name) {")
	for f in funcs:
		if f.get("isStatic"):
			continue
		if not proto and f["name"] == "_init":
			continue
		var wrapped = (f["name"] == "_initialize" or f["name"] == "_process") and not CTX.ctx["RAW_ABIS"].has(f["name"])
		var who = "__gd_" + f["name"] if wrapped else f["name"]
		var fwd = ""
		if f["name"] == "_init" and proto:
			fwd = "...args"
		elif not CTX.ctx["RAW_ABIS"].has(f["name"]):
			fwd = LAY.fwd_params(f["params"], "args")
		else:
			var abi = CTX.ctx["RAW_ABIS"][f["name"]]
			var parts = []
			for i in f["params"].size():
				var fn = "unboxNum"
				if abi["params"][i] == "str":
					fn = "unboxStr"
				parts.append("rt.fast." + fn + "(args[" + str(i) + "] as rt.Variant)")
			fwd = ", ".join(parts)
		out.append("      case " + JSON.stringify(f["name"]) + ": return rt.wrapValue(this." + who + "(" + fwd + "));")
	out.append("      default: return super.__gdDispatch(name, args);")
	out.append("    }")
	out.append("  }")
	out.append("")
	return out


static func emit_root_constructor(host_super):
	var out = ["  constructor(...__gd_new_args: rt.Variant[]) {"]
	if host_super:
		out.append("    super();")
	out.append("    this.__gd_fields__();")
	out.append("    if (!rt.bareConstruction()) this.__gdDispatch(\"_init\", __gd_new_args);")
	out.append("  }")
	out.append("")
	return out


static func emit_fields_only_constructor():
	return ["  constructor() {", "    super();", "    this.__gd_fields__();", "  }", ""]

static func _mset(list):
	var out = {}
	for x in list:
		out[x] = true
	return out


static func emit_accessors(v):
	var a = v.get("accessor")
	if a == null:
		return []
	var c = CTX.ctx
	var out = []
	var st = "static " if v.get("isStatic") == true else ""
	var slot = AB.prop_slot(v)
	var self_ref = str(c["CURRENT_CLASS"]) + "." if v.get("isStatic") == true else "this."
	var ES = load("res://emit_stmt.gd")
	out.append("  " + st + "get " + v["name"] + "() {")
	var getter = a.get("getter")
	if getter == null:
		if slot == null:
			out.append("    return rt.V.nil();")
		else:
			out.append("    return " + self_ref + slot + ";")
	elif getter.get("kind") == "inline":
		for s in getter["body"]:
			for l in ES.emit_stmt(s, false):
				out.append("    " + l)
	elif v.get("isStatic") == true and not c["STATIC_FUNCS"].has(getter["method"]):
		out.append("    return rt.reportNonStaticCall(" + JSON.stringify(getter["method"]) + ");")
	else:
		var prefix = str(c["CURRENT_CLASS"]) + "." if c["STATIC_FUNCS"].has(getter["method"]) else "this."
		out.append("    return " + prefix + getter["method"] + "();")
	out.append("  }")
	var setter = a.get("setter")
	var pname = "value"
	if setter != null and setter.get("kind") == "inline":
		pname = setter["param"]
	out.append("  " + st + "set " + v["name"] + "(" + pname + ") {")
	if setter == null:
		out.append("    // 只读属性：Godot 里写它是静默无操作，不是报错")
	elif setter.get("kind") == "inline":
		for s2 in setter["body"]:
			for l2 in ES.emit_stmt(s2, false):
				out.append("    " + l2)
	elif v.get("isStatic") == true and not c["STATIC_FUNCS"].has(setter["method"]):
		out.append("    rt.reportNonStaticCall(" + JSON.stringify(setter["method"]) + ");")
	else:
		var prefix2 = str(c["CURRENT_CLASS"]) + "." if c["STATIC_FUNCS"].has(setter["method"]) else "this."
		out.append("    " + prefix2 + setter["method"] + "(value);")
	out.append("  }")
	return out


static func emit_fields_method(vars, signals, chain_to_base, line_base):
	var c = CTX.ctx
	var out = []
	out.append("  override __gd_fields__() {" if chain_to_base else "  __gd_fields__() {")
	out.append("    const __gd_frame = rt.frameEnter(" + JSON.stringify(c["DEBUG_FILE"]) + ", \"@implicit_new\");")
	out.append("    try {")
	if chain_to_base:
		out.append("      super.__gd_fields__();")
	for s in signals:
		HE.mark(line_base + out.size(), s.get("loc"))
		var line = 0
		if s.get("loc") != null:
			line = s["loc"]["line"]
		out.append("      rt.frameLine(" + str(line) + ");")
		out.append("      this." + s["name"] + " = new rt.Signal(" + JSON.stringify(s["name"]) + ");")
	for v in vars:
		if v.get("isStatic") == true:
			continue
		var pre_slot = AB.prop_slot(v)
		if pre_slot != null:
			out.append("      this." + pre_slot + " = " + HE.type_default(v.get("type")) + ";")
		elif v.get("accessor") == null:
			out.append("      this." + v["name"] + " = " + HE.type_default(v.get("type")) + ";")
	for v in vars:
		if v.get("isStatic") == true:
			continue
		var slot = AB.prop_slot(v)
		if slot != null:
			HE.mark(line_base + out.size(), v.get("loc"))
			var line2 = 0
			if v.get("loc") != null:
				line2 = v["loc"]["line"]
			out.append("      rt.frameLine(" + str(line2) + ");")
			out.append("      this." + slot + " = " + AB.slot_init(v.get("type"), v.get("init")) + ";")
			continue
		if v.get("accessor") != null:
			continue
		HE.mark(line_base + out.size(), v.get("loc"))
		var line3 = 0
		if v.get("loc") != null:
			line3 = v["loc"]["line"]
		out.append("      rt.frameLine(" + str(line3) + ");")
		out.append("      this." + v["name"] + " = " + AB.slot_init(v.get("type"), v.get("init")) + ";")
	out.append("    } catch (__gd_err) {")
	out.append("      rt.gdFunctionError(__gd_err);")
	out.append("      return;")
	out.append("    } finally {")
	out.append("      rt.frameExit(__gd_frame);")
	out.append("    }")
	out.append("  }")
	out.append("")
	return out


static func emit_class_level_vars(vars, line_base):
	var c = CTX.ctx
	var out = []
	for v in vars:
		HE.mark(line_base + out.size(), v.get("loc"))
		if v.get("accessor") != null:
			if v.get("isStatic") == true and AB.prop_slot(v) != null:
				out.append(AB.prop_slot_init(v))
			for l in emit_accessors(v):
				out.append(l)
			continue
		if (v.get("isStatic") == true or v.get("isConst") == true) and c["DEFER_PRELOAD_CONSTS"].has(v["name"]):
			out.append("  static get " + v["name"] + "(): rt.Variant {")
			out.append("    if (__pre_" + v["name"] + " === null) __pre_" + v["name"] + " = " + AB.slot_init(v.get("type"), v.get("init"), v.get("isStatic") == true) + ";")
			out.append("    return __pre_" + v["name"] + " as rt.Variant;")
			out.append("  }")
			continue
		if v.get("isStatic") == true or v.get("isConst") == true:
			out.append("  static " + v["name"] + " = " + AB.slot_init(v.get("type"), v.get("init"), v.get("isStatic") == true) + ";")
	if out.size() > 0:
		out.append("")
	return out


static func emit_class_decl(decl, base = 0):
	if decl["innerClasses"].size() > 0:
		return {"__error": "inner-class", "message": "内部类 " + decl["name"] + " 里再套内部类还没实测过，不发"}
	var c = CTX.ctx
	var saved = c["CURRENT_MEMBERS"]
	var saved_types = c["VAR_TYPES"]
	var saved_statics = c["STATIC_FUNCS"]
	var saved_class = c["CURRENT_CLASS"]
	var saved_consts = c["CLASS_VALUE_OWNERS"]
	var saved_has_base = c["INIT_HAS_BASE"]
	var saved_as_method = c["INIT_AS_METHOD"]
	var saved_host_super = c["NEEDS_HOST_SUPER"]
	var saved_class_funcs = c["CLASS_FUNCS"]
	var saved_returns = c["FUNC_RETURNS"]
	var saved_class_signals = c["CLASS_SIGNALS"]
	var members = []
	for v in decl["vars"]:
		if v.get("isStatic") != true:
			members.append(v["name"])
	for g in decl["signals"]:
		members.append(g["name"])
	for n in LAY.inner_inherited_names(decl):
		members.append(n)
	c["CURRENT_MEMBERS"] = _mset(members)
	var sigs = []
	for g2 in decl["signals"]:
		sigs.append(g2["name"])
	c["CLASS_SIGNALS"] = _mset(sigs)
	var vt = {}
	for v2 in decl["vars"]:
		vt[v2["name"]] = v2.get("type")
	c["VAR_TYPES"] = vt
	var saved_engine = c["ENGINE_BASE"]
	c["CURRENT_CLASS"] = decl["name"]
	c["ENGINE_BASE"] = null
	var statics = []
	for f in decl["funcs"]:
		if f.get("isStatic") == true:
			statics.append(f["name"])
	c["STATIC_FUNCS"] = _mset(statics)
	var class_funcs = []
	for f2 in decl["funcs"]:
		class_funcs.append(f2["name"])
	for n2 in LAY.inner_inherited_method_names(decl):
		class_funcs.append(n2)
	c["CLASS_FUNCS"] = _mset(class_funcs)
	var returns = saved_returns.duplicate()
	for f3 in decl["funcs"]:
		returns[f3["name"]] = f3.get("returnType")
	c["FUNC_RETURNS"] = returns
	var owners = saved_consts.duplicate()
	for v3 in decl["vars"]:
		if v3.get("isConst") == true or v3.get("isStatic") == true:
			owners[v3["name"]] = decl["name"]
	c["CLASS_VALUE_OWNERS"] = owners
	var base_name = null
	if decl.get("extends") != null:
		base_name = LAY.inner_class_base(decl["extends"])
	var proto = base_name != null or c["EXTENDED_INNER"].has(decl["name"])
	c["INIT_HAS_BASE"] = base_name != null
	c["INIT_AS_METHOD"] = proto
	c["NEEDS_HOST_SUPER"] = not proto
	var lines = ["class " + decl["name"] + (" extends " + base_name if base_name != null else " extends rt.GdScriptObject") + " {"]
	HE.mark(base, decl.get("loc"))
	if proto and base_name == null:
		for l in emit_root_constructor(true):
			lines.append(l)
	for l2 in emit_field_declarations(decl["vars"], decl["signals"]):
		lines.append(l2)
	for l3 in emit_fields_method(decl["vars"], decl["signals"], base_name != null, base + lines.size()):
		lines.append(l3)
	for l4 in emit_class_level_vars(decl["vars"], base + lines.size()):
		lines.append(l4)
	var has_init = false
	for f4 in decl["funcs"]:
		if f4["name"] == "_init" and f4.get("isStatic") != true:
			has_init = true
	if not proto and not has_init:
		for l5 in emit_fields_only_constructor():
			lines.append(l5)
	var inherited = LAY.inner_inherited_method_names(decl)
	c["INHERITED_METHODS"] = _mset(inherited)
	c["SCRIPT_INHERITED"] = c["INHERITED_METHODS"]
	for f5 in decl["funcs"]:
		var func_base = base + lines.size()
		for l6 in load("res://func.gd").emit_func(f5, func_base):
			lines.append("  " + l6)
	c["INHERITED_METHODS"] = {}
	c["SCRIPT_INHERITED"] = {}
	for l7 in emit_dispatch(decl["funcs"], proto):
		lines.append(l7)
	lines.append("}")
	var init_fn = null
	for f6 in decl["funcs"]:
		if f6["name"] == "_init" and f6.get("isStatic") != true:
			init_fn = f6
	lines.append("const __gd_d_" + decl["name"] + " = rt.defineClass(" + decl["name"] + ", " + HE.make_closure(decl["name"], init_fn, proto) + ", (o) => o instanceof " + decl["name"] + ");")
	lines.append("rt.nameClass(__gd_d_" + decl["name"] + ", " + JSON.stringify(decl["name"]) + ");")
	if base_name != null:
		lines.append("rt.setClassBase(__gd_d_" + decl["name"] + ", rt.lookupClass(" + JSON.stringify(base_name) + ") ?? null);")
	var non_static = []
	for v4 in decl["vars"]:
		if v4.get("isStatic") != true:
			non_static.append(v4)
	var decl_fields = LAY.field_types_literal(non_static)
	if decl_fields != null:
		lines.append("rt.registerFieldTypes(__gd_d_" + decl["name"] + ", " + decl_fields + ");")
	var decl_props = LAY.script_props_literal(non_static)
	if decl_props != null:
		lines.append("rt.registerScriptProps(__gd_d_" + decl["name"] + ", " + decl_props + ", " + LAY.script_props_reader_literal(decl["name"], non_static) + ");")
	lines.append(LAY.dict_identity_literal("__gd_d_" + decl["name"], decl["name"], decl["vars"], decl["name"]))
	var static_vars = LAY.static_var_table_literal(decl["vars"])
	var static_slots = AB.static_var_slots_literal(decl["name"], decl["vars"])
	if static_vars != null and static_slots != null:
		lines.append("rt.registerStaticVars(__gd_d_" + decl["name"] + ", " + static_vars + ", " + static_slots + ");")
	var arities = LAY.method_arities_literal(decl["funcs"])
	if arities != null:
		lines.append("rt.registerMethodArities(__gd_d_" + decl["name"] + ", " + arities + ");")
	var ctors = LAY.ctor_arities_literal(decl["funcs"])
	if ctors != null:
		lines.append("rt.registerCtorArities(__gd_d_" + decl["name"] + ", " + ctors + ");")
	var params = LAY.method_params_literal(decl["funcs"])
	if params != null:
		lines.append("rt.registerMethodParams(__gd_d_" + decl["name"] + ", " + params + ");")
	var static_names = LAY.static_names_literal(decl["funcs"])
	if static_names.size() > 0:
		lines.append("rt.registerStaticMethods(__gd_d_" + decl["name"] + ", " + JSON.stringify(static_names) + ", " + LAY.statics_table_literal(decl["name"], decl["funcs"]) + ");")
	if base_name == null:
		lines.append("rt.registerNativeBase(__gd_d_" + decl["name"] + ", \"RefCounted\");")
	lines.append("")
	c["CURRENT_MEMBERS"] = saved
	c["CLASS_SIGNALS"] = saved_class_signals
	c["VAR_TYPES"] = saved_types
	c["STATIC_FUNCS"] = saved_statics
	c["CURRENT_CLASS"] = saved_class
	c["ENGINE_BASE"] = saved_engine
	c["CLASS_VALUE_OWNERS"] = saved_consts
	c["INIT_HAS_BASE"] = saved_has_base
	c["INIT_AS_METHOD"] = saved_as_method
	c["NEEDS_HOST_SUPER"] = saved_host_super
	c["CLASS_FUNCS"] = saved_class_funcs
	c["FUNC_RETURNS"] = saved_returns
	return lines
