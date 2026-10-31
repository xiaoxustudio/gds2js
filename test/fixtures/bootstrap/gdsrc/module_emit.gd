const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")
const LAY = preload("res://layout.gd")
const AB = preload("res://abi.gd")
const CL = preload("res://class.gd")
const GLOB = preload("res://globals.gd")
const SM = preload("res://sourcemap.gd")

const ENTRY_OWNED = {"run": true, "__gdDispatch": true}


static func scene_literal(children):
	if children.is_empty():
		return "[]"
	var parts = []
	for c in children:
		parts.append("rt.sceneNode(" + c["expr"] + ", " + JSON.stringify(c["name"]) + ", " + JSON.stringify(c["cls"]) + ", " + scene_literal(c["children"]) + ")")
	return "[" + ", ".join(parts) + "]"


static func emit_module(m, opts, analysis_result):
	var res = emit_module_with_map(m, opts, analysis_result)
	if res.has("__error"):
		return res
	return res["code"]


static func emit_module_with_map(m, opts, analysis_result):
	CTX.begin_emit(analysis_result)
	var c = CTX.ctx
	c["MAP_ACTIVE"] = opts.get("sourcemap") == true
	c["LAMBDA_DEPTH"] = 0
	c["LINE_MAPPINGS"] = []
	var runtime_import = opts.get("runtimeImport")
	var host_import = opts.get("hostImport")
	var auto_run = opts.get("autoRun")
	if auto_run == null:
		auto_run = true
	var cls_name = opts.get("className")
	if cls_name == null:
		cls_name = "Main"
	var class_refs = opts.get("classRefs")
	if class_refs == null:
		class_refs = []
	var res_path = opts.get("resPath")
	c["DEBUG_FILE"] = res_path if res_path != null else (opts.get("sourceFile") if opts.get("sourceFile") != null else cls_name + ".gd")
	c["MODULE_RES_PATH"] = res_path
	var preloads = opts.get("preloads")
	if preloads == null:
		preloads = []
	var side_effect_imports = opts.get("sideEffectImports")
	if side_effect_imports == null:
		side_effect_imports = []
	var base_class = opts.get("baseClass")
	if base_class == null:
		base_class = {"kind": "host"} if host_import != null else {"kind": "none"}
	var inherited_members = opts.get("inheritedMembers")
	if inherited_members == null:
		inherited_members = []
	var host_chain = base_class["kind"] == "host" or opts.get("hostBaseInChain") == true
	var module_vars = {}
	for v in m["vars"]:
		if v.get("isStatic") != true:
			module_vars[v["name"]] = true
	for s in m["signals"]:
		module_vars[s["name"]] = true
	for n in inherited_members:
		module_vars[n] = true
	c["MODULE_VARS"] = module_vars
	var module_signals = {}
	for s2 in m["signals"]:
		module_signals[s2["name"]] = true
	c["MODULE_SIGNALS"] = module_signals
	var module_funcs = {}
	for f in m["funcs"]:
		module_funcs[f["name"]] = true
	c["MODULE_FUNCS"] = module_funcs
	var param_types = {}
	var func_returns = {}
	for f2 in m["funcs"]:
		param_types[f2["name"]] = f2["params"]
		func_returns[f2["name"]] = f2.get("returnType")
	c["PARAM_TYPES"] = param_types
	c["FUNC_RETURNS"] = func_returns
	var class_funcs = {}
	for f3 in m["funcs"]:
		class_funcs[f3["name"]] = true
	for n2 in inherited_members:
		class_funcs[n2] = true
	if host_chain:
		for n3 in GLOB.HOST_MEMBERS.keys():
			class_funcs[n3] = true
	c["CLASS_FUNCS"] = class_funcs
	c["CURRENT_CLASS"] = cls_name
	c["ENGINE_BASE"] = base_class["name"] if base_class["kind"] == "engine" else null
	var statics = {}
	for f4 in m["funcs"]:
		if f4.get("isStatic") == true:
			statics[f4["name"]] = true
	c["STATIC_FUNCS"] = statics
	var owners = {}
	for v2 in m["vars"]:
		if v2.get("isConst") == true or v2.get("isStatic") == true:
			owners[v2["name"]] = cls_name
	c["CLASS_VALUE_OWNERS"] = owners
	var class_values = {}
	class_values[cls_name] = _class_value_set(m["vars"])
	c["CLASS_VALUES"] = class_values
	for cl in m["innerClasses"]:
		_collect_class_values(cl, class_values)
	var var_types = {}
	for v3 in m["vars"]:
		var_types[v3["name"]] = v3.get("type")
	c["VAR_TYPES"] = var_types
	var script_base = {}
	for cl2 in m["innerClasses"]:
		LAY.collect_script_base(cl2, script_base)
	c["SCRIPT_BASE"] = script_base
	var module_classes = {}
	for cl3 in m["innerClasses"]:
		module_classes[cl3["name"]] = true
	if m.get("className") != null:
		module_classes[m["className"]] = true
	for r in class_refs:
		module_classes[r["name"]] = true
	c["MODULE_CLASSES"] = module_classes
	var inner = {}
	for cl4 in m["innerClasses"]:
		_index_inner(cl4, inner)
	c["INNER_CLASSES"] = inner
	var extended_inner = {}
	for cl5 in inner.values():
		if cl5.get("extends") != null and inner.has(cl5["extends"]):
			extended_inner[cl5["extends"]] = true
	c["EXTENDED_INNER"] = extended_inner
	var preload_map = {}
	for p in preloads:
		preload_map[p["literal"]] = p["name"]
	c["PRELOADS"] = preload_map
	var preload_consts = opts.get("preloadConsts")
	if preload_consts == null:
		preload_consts = {}
	var defer = {}
	for v4 in m["vars"]:
		var init = v4.get("init")
		if v4.get("isConst") != true or init == null or init.get("kind") != "call" or init["callee"].get("kind") != "ident":
			continue
		if init["callee"]["name"] != "preload" and init["callee"]["name"] != "load":
			continue
		defer[v4["name"]] = true
	c["DEFER_PRELOAD_CONSTS"] = defer
	var preload_classes = opts.get("preloadClasses")
	if preload_classes == null:
		preload_classes = {}
	var face_owners = {}
	for v5 in m["vars"]:
		var init2 = v5.get("init")
		if v5.get("isConst") != true or init2 == null or init2.get("kind") != "call" or init2["callee"].get("kind") != "ident":
			continue
		if init2["callee"]["name"] != "preload" and init2["callee"]["name"] != "load":
			continue
		if init2["args"].is_empty():
			continue
		var a = init2["args"][0]
		if a.get("kind") != "lit" or a.get("lit") != "string":
			continue
		var pc = preload_map.get(str(a["value"]))
		if pc == null:
			continue
		var names = {}
		for n4 in preload_consts.get(pc, []):
			names[n4] = true
		for n5 in preload_classes.get(pc, []):
			names[n5] = true
		if names.size() > 0:
			face_owners[v5["name"]] = {"cls": pc, "names": names}
	c["PRELOAD_FACE_OWNERS"] = face_owners
	var loads = {}
	for l in opts.get("loadMap") if opts.get("loadMap") != null else []:
		loads[l["literal"]] = l["resPath"]
	c["LOADS"] = loads

	var out = []
	out.append("// 由 gds2js 从 main.gd 编译生成 —— 不要手改。")
	out.append("")
	var runtime_mode = opts.get("runtimeMode")
	if runtime_mode == null:
		runtime_mode = "import"
	if runtime_mode == "single":
		if opts.get("standaloneInline") == null:
			return {"__error": "emit-standalone", "message": "single 模式需要 standaloneInline"}
		for line in HE.standalone_inline_header(opts["standaloneInline"]).split("\n"):
			out.append(line)
	elif runtime_mode == "local":
		var p2 = opts.get("standaloneRequirePath")
		if p2 == null:
			p2 = "./gds2js-standalone.cjs"
		out.append("import { createRequire } from \"node:module\";")
		out.append("const { rt, " + ", ".join(HE.HOST_PRINT_NAMES) + ", SceneTree" + (", sceneRun" if opts.get("scene") != null else "") + " } = createRequire(import.meta.url)(" + JSON.stringify(p2) + ");")
	else:
		out.append("import * as rt from " + JSON.stringify(runtime_import) + ";")
		if host_import != null:
			var host_names = []
			if base_class["kind"] == "host":
				for n6 in HE.HOST_PRINT_NAMES:
					host_names.append(n6)
				host_names.append("SceneTree")
			else:
				for n7 in HE.HOST_PRINT_NAMES:
					host_names.append(n7)
			if opts.get("scene") != null:
				host_names.append("sceneRun")
			out.append("import { " + ", ".join(host_names) + " } from " + JSON.stringify(host_import) + ";")
	var imports = {}
	for r2 in class_refs:
		imports[r2["name"]] = r2["from"]
	for p3 in preloads:
		imports[p3["name"]] = p3["from"]
	for name in imports.keys():
		out.append("import { " + name + " } from " + JSON.stringify(imports[name]) + ";")
	var bare = {}
	for s3 in side_effect_imports:
		bare[s3] = true
	for r3 in class_refs:
		bare[r3["from"]] = true
	for p4 in preloads:
		bare[p4["from"]] = true
	for spec in bare.keys():
		out.append("import " + JSON.stringify(spec) + ";")
	if base_class["kind"] == "import":
		out.append("import { " + base_class["name"] + " } from " + JSON.stringify(base_class["from"]) + ";")
	out.append("")

	var reserved_extra = {}
	for v6 in m["vars"]:
		reserved_extra[v6["name"]] = true
	for r4 in class_refs:
		reserved_extra[r4["name"]] = true
	for p5 in preloads:
		reserved_extra[p5["name"]] = true
	var global_consts = HE.global_const_lines(m, reserved_extra)
	if global_consts.size() > 0:
		for l2 in global_consts:
			out.append(l2)
		out.append("")

	c["ENUM_NAMES"] = {}
	for en in m["enums"]:
		HE.mark(out.size(), en.get("loc"))
		if en.get("name") != null:
			c["ENUM_NAMES"][en["name"]] = true
			var pairs = []
			for mm in en["members"]:
				pairs.append("[rt.V.str(" + JSON.stringify(mm["name"]) + "), rt.V.int(" + str(mm["value"]) + ")]")
			out.append("const " + en["name"] + " = rt.dictOf([" + ", ".join(pairs) + "]);")
		else:
			for mm2 in en["members"]:
				out.append("const " + mm2["name"] + " = rt.V.int(" + str(mm2["value"]) + ");")
	if m["enums"].size() > 0:
		out.append("")

	var inherited_set = {}
	for n8 in inherited_members:
		inherited_set[n8] = true
	var external_set = {}
	for n9 in opts.get("rawAbiExternal") if opts.get("rawAbiExternal") != null else []:
		external_set[n9] = true
	c["RAW_ABIS"] = AB.compute_raw_abis(m, {"hasBase": base_class["kind"] == "import", "inherited": inherited_set, "external": external_set})

	var heritage = " extends SceneTree" if base_class["kind"] == "host" else ""
	if base_class["kind"] == "import":
		heritage = " extends " + base_class["name"]
	elif base_class["kind"] == "engine":
		heritage = " extends rt.GdNodeObject"
	elif base_class["kind"] != "host":
		heritage = " extends rt.GdScriptObject"
	var proto = base_class["kind"] == "import" or opts.get("extendedByScript") == true
	c["INIT_HAS_BASE"] = base_class["kind"] == "import"
	c["INIT_AS_METHOD"] = proto
	c["NEEDS_HOST_SUPER"] = not proto
	for v7 in m["vars"]:
		if defer.has(v7["name"]):
			out.append("let __pre_" + v7["name"] + ": rt.Variant | null = null;")
	out.append("export class " + cls_name + heritage + " {")
	if base_class["kind"] == "engine":
		out.append("  override __gd_engine_class__ = " + JSON.stringify(base_class["name"]) + ";")
		out.append("  override __gd_freed__ = false;")
		out.append("  override __gd_node_queued__ = false;")
		out.append("  override __gd_node_name__ = \"\";")
		out.append("  override __gd_node_parent__: object | null = null;")
		out.append("  override __gd_node_children__: object[] = [];")
		out.append("  override __gd_node_groups__: string[] = [];")
	if proto and base_class["kind"] != "import":
		for l3 in CL.emit_root_constructor(true):
			out.append(l3)
	for l4 in CL.emit_field_declarations(m["vars"], m["signals"]):
		out.append(l4)
	for l5 in CL.emit_fields_method(m["vars"], m["signals"], proto and base_class["kind"] == "import", out.size()):
		out.append(l5)
	for l6 in CL.emit_class_level_vars(m["vars"], out.size()):
		out.append(l6)
	if opts.get("exportInner") == true:
		for l7 in CL.emit_inner_mirrors(m["innerClasses"]):
			out.append(l7)
	var has_init = false
	for f5 in m["funcs"]:
		if f5["name"] == "_init" and f5.get("isStatic") != true:
			has_init = true
	if not proto and not has_init:
		for l8 in CL.emit_fields_only_constructor():
			out.append(l8)
	var inherited_methods = {}
	for n10 in inherited_members:
		inherited_methods[n10] = true
	if host_chain:
		for n11 in GLOB.HOST_MEMBERS.keys():
			inherited_methods[n11] = true
	c["INHERITED_METHODS"] = inherited_methods
	c["SCRIPT_INHERITED"] = inherited_members.duplicate()
	for cl6 in m["innerClasses"]:
		if cl6["name"] == cls_name:
			return {"__error": "emit-class-clash", "message": "内部类 " + cl6["name"] + " 与文件名派生出的模块类同名：两支会发成同一个标识符，产物是非法 JS —— 换掉其中一个的名字"}
	for f6 in m["funcs"]:
		if f6.get("isStatic") != true and ENTRY_OWNED.has(f6["name"]) and c["INHERITED_METHODS"].has(f6["name"]):
			return {"__error": "emit-entry-name", "message": f6["name"] + "() 占的是产物入口的名字，脚本自己声明它会把入口盖掉：换个名"}
	for f7 in m["funcs"]:
		var base = out.size()
		var fl = load("res://func.gd").emit_func(f7, base)
		if fl is Dictionary:
			return fl
		for line2 in fl:
			out.append("  " + line2)
	c["INHERITED_METHODS"] = {}
	c["SCRIPT_INHERITED"] = {}
	for l9 in CL.emit_dispatch(m["funcs"], proto):
		out.append(l9)
	out.append("}")
	out.append("")

	var init_fn = null
	for f8 in m["funcs"]:
		if f8["name"] == "_init" and f8.get("isStatic") != true:
			init_fn = f8
	out.append("const __gd_d_" + cls_name + " = rt.defineClass(" + cls_name + ", " + HE.make_closure(cls_name, init_fn, proto) + ", (o) => o instanceof " + cls_name + ");")
	if m.get("className") != null:
		out.append("rt.nameClass(__gd_d_" + cls_name + ", " + JSON.stringify(m["className"]) + ");")
	if base_class["kind"] == "import":
		out.append("rt.setClassBase(__gd_d_" + cls_name + ", rt.lookupClass(" + JSON.stringify(base_class["name"]) + ") ?? null);")
	var non_static = []
	for v8 in m["vars"]:
		if v8.get("isStatic") != true:
			non_static.append(v8)
	var module_fields = LAY.field_types_literal(non_static)
	if module_fields != null:
		out.append("rt.registerFieldTypes(__gd_d_" + cls_name + ", " + module_fields + ");")
	var module_props = LAY.script_props_literal(non_static)
	if module_props != null:
		out.append("rt.registerScriptProps(__gd_d_" + cls_name + ", " + module_props + ", " + LAY.script_props_reader_literal(cls_name, non_static) + ");")
	out.append(LAY.dict_identity_literal("__gd_d_" + cls_name, "", m["vars"], cls_name))
	var module_static_vars = LAY.static_var_table_literal(m["vars"])
	var module_static_slots = AB.static_var_slots_literal(cls_name, m["vars"])
	if module_static_vars != null and module_static_slots != null:
		out.append("rt.registerStaticVars(__gd_d_" + cls_name + ", " + module_static_vars + ", " + module_static_slots + ");")
	var module_arities = LAY.method_arities_literal(m["funcs"])
	if module_arities != null:
		out.append("rt.registerMethodArities(__gd_d_" + cls_name + ", " + module_arities + ");")
	var module_ctor = LAY.ctor_arities_literal(m["funcs"])
	if module_ctor != null:
		out.append("rt.registerCtorArities(__gd_d_" + cls_name + ", " + module_ctor + ");")
	var module_params = LAY.method_params_literal(m["funcs"])
	if module_params != null:
		out.append("rt.registerMethodParams(__gd_d_" + cls_name + ", " + module_params + ");")
	var module_statics = LAY.static_names_literal(m["funcs"])
	if module_statics.size() > 0:
		out.append("rt.registerStaticMethods(__gd_d_" + cls_name + ", " + JSON.stringify(module_statics) + ", " + LAY.statics_table_literal(cls_name, m["funcs"]) + ");")
	if base_class["kind"] == "engine":
		out.append("rt.registerNativeBase(__gd_d_" + cls_name + ", " + JSON.stringify(base_class["name"]) + ");")
	elif base_class["kind"] != "import":
		out.append("rt.registerNativeBase(__gd_d_" + cls_name + ", " + JSON.stringify("SceneTree" if base_class["kind"] == "host" else "RefCounted") + ");")
	var script_label = m.get("className")
	if script_label == null:
		var path_for_label = res_path if res_path != null else opts.get("sourceFile")
		script_label = HE.basename_of_gd(path_for_label)
	if script_label == null:
		script_label = cls_name + ".gd"
	out.append("rt.registerScriptLabel(__gd_d_" + cls_name + ", " + JSON.stringify(script_label) + ");")
	if res_path != null:
		out.append("rt.registerScript(" + JSON.stringify(res_path) + ", __gd_d_" + cls_name + ");")

	for cl7 in LAY.order_inner_classes(m["innerClasses"]):
		var base2 = out.size()
		var decl_lines = CL.emit_class_decl(cl7, base2)
		if decl_lines is Dictionary:
			return decl_lines
		for line3 in decl_lines:
			out.append(line3)
	if opts.get("exportInner") == true:
		for cl8 in m["innerClasses"]:
			out.append(cls_name + "." + cl8["name"] + " = " + cl8["name"] + ";")
		if m["innerClasses"].size() > 0:
			out.append("")

	if auto_run:
		if opts.get("projectName") != null and opts["projectName"] != "":
			out.append("rt.setHostProjectName(" + JSON.stringify(opts["projectName"]) + ");")
		out.append("const __gd_entry = new " + cls_name + "();")
		out.append("try {")
		if opts.get("scene") != null:
			var sc = opts["scene"]
			out.append("  await sceneRun(__gd_entry, " + JSON.stringify(sc["rootName"]) + ", " + JSON.stringify(sc["rootCls"]) + ", " + scene_literal(sc["children"]) + ");")
		else:
			out.append("  await __gd_entry.run();")
		out.append("} catch (__gd_e) {")
		out.append("  rt.reportRunFailure(__gd_e);")
		out.append("}")

	var code = "\n".join(out) + "\n"
	var map = null
	if c["MAP_ACTIVE"]:
		var source_file = opts.get("sourceFile")
		if source_file == null:
			source_file = cls_name + ".gd"
		var js_file = opts.get("jsFile")
		if js_file == null:
			js_file = cls_name + ".mjs"
		map = SM.build_source_map(js_file, source_file, c["LINE_MAPPINGS"])
		code += "//# sourceMappingURL=" + js_file + ".map\n"
	c["MAP_ACTIVE"] = false
	c["RAW_ABIS"] = {}
	c["RAW_ARRAYS"] = {}
	c["RAW_DICTS"] = {}
	c["CURRENT_RET"] = null
	c["VAR_TYPES"] = {}
	c["LOCAL_TYPES"] = {}
	c["CLASS_FUNCS"] = {}
	c["FUNC_RETURNS"] = {}
	c["UNTYPED_NAMES"] = {}
	return {"code": code, "map": map}


static func _class_value_set(vars):
	var s = {}
	for v in vars:
		if v.get("isConst") == true or v.get("isStatic") == true:
			s[v["name"]] = true
	return s


static func _collect_class_values(decl, table):
	table[decl["name"]] = _class_value_set(decl["vars"])
	for inner in decl["innerClasses"]:
		_collect_class_values(inner, table)


static func _index_inner(decl, table):
	table[decl["name"]] = decl
	for inner in decl["innerClasses"]:
		_index_inner(inner, table)
