static var ctx = new_context()
static var analysis = null


static func new_context():
	return {
		"MODULE_VARS": {},
		"MODULE_SIGNALS": {},
		"CLASS_SIGNALS": {},
		"MODULE_FUNCS": {},
		"PARAM_TYPES": {},
		"MODULE_CLASSES": {},
		"SCRIPT_BASE": {},
		"INNER_CLASSES": {},
		"EXTENDED_INNER": {},
		"PRELOADS": {},
		"DEFER_PRELOAD_CONSTS": {},
		"PRELOAD_FACE_OWNERS": {},
		"LOADS": {},
		"IN_INIT": false,
		"INIT_HAS_BASE": false,
		"CURRENT_FUNC": "",
		"LAMBDA_DEPTH": 0,
		"DEBUG_FILE": "",
		"MODULE_RES_PATH": null,
		"INIT_AS_METHOD": false,
		"INHERITED_METHODS": {},
		"SCRIPT_INHERITED": {},
		"NEEDS_HOST_SUPER": false,
		"ENUM_NAMES": {},
		"CURRENT_MEMBERS": {},
		"STATIC_FUNCS": {},
		"CURRENT_CLASS": "",
		"ENGINE_BASE": null,
		"selfInNilContext": false,
		"CLASS_VALUE_OWNERS": {},
		"CLASS_VALUES": {},
		"VAR_TYPES": {},
		"LOCAL_TYPES": {},
		"FUNC_BINDS": {},
		"FUNC_RETURNS": {},
		"UNTYPED_NAMES": {},
		"CLASS_FUNCS": {},
		"MAP_ACTIVE": false,
		"LINE_MAPPINGS": [],
		"UNBOXED": {},
		"RAW_ABIS": {},
		"CURRENT_RET": null,
		"CURRENT_RET_ANN": null,
		"RAW_ARRAYS": {},
		"RAW_DICTS": {},
	}


static func get_analysis():
	return analysis


static func begin_emit(analysis_result):
	ctx = new_context()
	analysis = analysis_result
