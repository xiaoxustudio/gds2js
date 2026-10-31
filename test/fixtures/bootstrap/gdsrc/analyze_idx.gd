const AS = preload("res://analyze_state.gd")
const WK = preload("res://walk.gd")
const NF = preload("res://node_face.gd")
const GLOB = preload("res://globals.gd")
const TY = preload("res://typed.gd")
const IX = preload("res://index_slots.gd")
const VA = preload("res://var_assign.gd")
const PK = preload("res://pack.gd")
const MA = preload("res://method_arity.gd")
const DE = preload("res://decls.gd")
const OP = preload("res://operators.gd")
const CA = preload("res://calls.gd")
const T = preload("res://arity_tables.gd")


static func _enum_names(m):
	var out = []
	for en in m["enums"]:
		if en.get("name") != null:
			out.append(en["name"])
		else:
			for mm in en["members"]:
				out.append(mm["name"])
	return out


static func _str_name(m):
	if m.get("className") != null:
		return m["className"]
	return null


static func analyze(m, globals = null, owner = null, host_chain = false):
	if globals == null:
		globals = {}
	var key = owner
	if key == null or key == "":
		key = "#" + str(AS.next_mark_seq())
	AS.reset_run(key)
	WK.seed_outer_names(m)
	WK.mark_class_face_receivers(m)
	var diags = []
	var enum_names = _enum_names(m)
	var globals_list = []
	for g in globals:
		globals_list.append(g)
	var global_names = []
	var cn = _str_name(m)
	if cn != null:
		global_names.append(cn)
	for n in AS.decl_names(m):
		global_names.append(n)
	for n in enum_names:
		global_names.append(n)
	for n in globals_list:
		global_names.append(n)
	var global_scope = AS.Scope.make(global_names, null)
	var module_scope = global_scope.child(AS.decl_names(m))
	var coroutines = {}
	for f in m["funcs"]:
		if f.get("coroutine") == true:
			coroutines[f["name"]] = true
	var classes = WK.class_table(m)
	var base_names = []
	if cn != null:
		base_names.append(cn)
	for v in m["vars"]:
		if v.get("isConst") == true:
			base_names.append(v["name"])
	for c in m["innerClasses"]:
		base_names.append(c["name"])
	for n in enum_names:
		base_names.append(n)
	for n in globals_list:
		base_names.append(n)
	var class_scope_base = AS.Scope.make(base_names, null)
	var host_face = {}
	if m.get("extends") == "SceneTree" or host_chain:
		host_face = GLOB.HOST_VALUE_METHODS
	var engine_base = m.get("extends")
	if engine_base != null and not GLOB.is_engine_self_base(engine_base):
		engine_base = null
	var engine_face = NF.node_self_props(engine_base)
	for f in m["funcs"]:
		WK.check_func(f, module_scope, coroutines, diags, host_face, engine_face)
	DE.check_return_paths(m["funcs"], diags)
	DE.check_field_inits(m["vars"], module_scope, coroutines, diags, host_face)
	for c in m["innerClasses"]:
		DE.check_class(c, class_scope_base, diags, classes)
	CA.check_static_access(m["funcs"], m["vars"], diags)
	DE.check_class_func_visibility(m, diags)
	TY.check_typed_collections(m, diags)
	IX.check_typed_index_slots(m, diags)
	DE.check_const_assign(m, diags, host_face)
	OP.check_bool_ordering(m, diags)
	PK.check_pack_is_as(m, diags)
	PK.check_pack_arg_slots(m, diags)
	OP.check_percent_format(m, diags)
	PK.check_pack_face_names(m, diags)
	for d in MA.check_dict_method_arity(m):
		diags.append(d)
	for d in MA.check_array_method_arity(m):
		diags.append(d)
	OP.check_void_method_values(m, diags)
	CA.check_ctor_signatures(m, diags)
	CA.check_string_method_arity(m, diags)
	CA.check_named_face(m, {"type": "StringName", "lit": "string_name", "arity": T.STRING_NAME_ARITY, "arityCode": "string-name-arity"}, diags)
	CA.check_named_face(m, {"type": "NodePath", "lit": "node_path", "arity": T.NODE_PATH_ARITY, "arityCode": "node-path-arity"}, diags)
	OP.check_operand_pairs(m, diags)
	CA.check_func_arg_slots(m, globals, diags)
	VA.check_typed_var_assign(m, diags)
	DE.check_param_default_assign(m, diags)
	OP.check_void_annotation(m, diags)
	DE.check_script_class_slots(m, diags)
	DE.check_signal_defaults(m, diags)
	for d in MA.check_dict_duplicate_keys(m):
		diags.append(d)
	CA.check_value_method_arity(m, diags)
	DE.check_init_contracts(m, globals, diags)
	DE.check_property_delegates(m, diags)
	var r = AS.get_run()
	return {"owner": r["owner"], "diagnostics": diags, "run": r}


static func pos_read_label(result, e):
	if e.get("kind") != "index":
		return null
	var r = result["run"]
	return r["posReadLabels"].get(AS.di_key(r, e["loc"]["line"], e["loc"]["col"]))


static func bound_face(result, e):
	if e.get("kind") != "attribute":
		return null
	var r = result["run"]
	var hit = r["boundFaces"].get(AS.di_key(r, e["loc"]["line"], e["loc"]["col"]))
	if hit == null:
		return null
	var parts = hit.split(",")
	return {"face": parts[0], "min": int(parts[1]), "max": int(parts[2])}


static func is_dict_int_read(result, e):
	if e.get("kind") != "index":
		return false
	var r = result["run"]
	return r["dictIntReads"].has(AS.di_key(r, e["loc"]["line"], e["loc"]["col"]))


static func is_global_value_read(result, e):
	if e.get("kind") != "ident":
		return false
	var r = result["run"]
	return r["globalValueReads"].has(AS.gv_key(r, e["name"], e["loc"]["line"], e["loc"]["col"]))


static func is_native_class_read(result, e):
	if e.get("kind") != "ident":
		return false
	var r = result["run"]
	return r["nativeClassReads"].has(AS.gv_key(r, e["name"], e["loc"]["line"], e["loc"]["col"]))


static func is_host_method_read(result, e):
	if e.get("kind") != "ident":
		return false
	var r = result["run"]
	return r["hostMethodReads"].has(AS.gv_key(r, e["name"], e["loc"]["line"], e["loc"]["col"]))


static func is_engine_prop_read(result, e):
	if e.get("kind") != "ident":
		return false
	var r = result["run"]
	return r["enginePropReads"].has(AS.gv_key(r, e["name"], e["loc"]["line"], e["loc"]["col"]))


static func lambda_capture_names_of(result, e):
	if e.get("kind") != "lambda" or e.get("loc") == null:
		return []
	var r = result["run"]
	var caps = r["lambdaCaptures"].get(AS.cap_key(r, e["loc"]["line"], e["loc"]["col"]))
	if caps == null:
		return []
	return caps
