const C = preload("res://cst.gd")
const LI = preload("res://lit.gd")
const LE = preload("res://lower_expr.gd")
const DB = preload("res://double.gd")
const D = preload("res://diag.gd")
const G = preload("res://globals.gd")

const ARM_PATTERN = "Expression in match pattern must be a constant expression, an identifier, or an attribute access (\"A.B\")."
const ARM_LITERAL_NODES = ["integer", "float", "string", "string_name", "node_path", "true", "false", "null"]
const ARM_FOLD_GLOBALS = ["int", "len", "abs", "mini", "max", "sign", "sqrt", "deg_to_rad", "snapped", "absf", "lerpf", "posmod", "move_toward", "maxf", "minf", "clampi", "signi", "pow", "exp", "log", "sin", "cos", "tan", "sinh", "cosh", "tanh", "asin", "acos", "atan", "atan2", "rad_to_deg", "floor", "ceil", "round", "roundf", "fposmod", "lerp", "min", "maxi", "lerp_angle", "smoothstep", "snappedf", "snappedi", "wrap", "wrapi", "wrapf", "is_equal_approx", "is_finite", "is_nan", "inverse_lerp", "db_to_linear", "linear_to_db", "ease", "bezier_interpolate", "cubic_interpolate", "cubic_interpolate_angle", "float", "fmod", "ceilf", "floori", "ceili", "acosh", "asinh", "atanh", "remap", "floorf", "roundi", "absi", "signf", "is_inf", "is_zero_approx", "step_decimals", "cubic_interpolate_in_time", "cubic_interpolate_angle_in_time", "bezier_derivative", "angle_difference", "rotate_toward", "clamp", "clampf", "nearest_po2", "pingpong"]
const ARM_NO_CTOR = ["Signal"]
const SELF_BASES = ["self"]

static var pack_codec_use = false
static var script_func_names = []
static var script_instance_methods = {}
static var failed = false
static var last_error = null


static func err(code, message):
	failed = true
	last_error = {"__error": code, "message": message}
	return null


static func fail_err(code, message, loc):
	failed = true
	last_error = {"__error": code, "message": message, "loc": loc}
	return null


static func has_name(table, name):
	for k in table:
		if k == name:
			return true
	return false


static func has_key(d, key):
	return d.has(key)


static func lower(tree):
	pack_codec_use = false
	failed = false
	last_error = null
	var bad = C.syntax_err_of(tree)
	if bad != null:
		failed = true
		last_error = {"__error": bad["code"], "message": bad["sentence"]}
		return null
	var idx = C.index_tree(tree["rootNode"])
	# 父表按 id 存，表达式那一半要用
	var m = lower_module(tree["rootNode"], idx)
	if failed:
		return null
	m["usesPackCodec"] = pack_codec_use
	return m


static func lower_module(root, idx):
	script_func_names = []
	script_instance_methods = {}
	for c in C.named(root):
		if c["type"] == "function_definition":
			var nm = C.field(c, "name")
			script_func_names.append("" if nm == null else nm["text"])
	for cls in C.named(root):
		if cls["type"] != "class_definition":
			continue
		var cname = ""
		var body = null
		for k in C.named(cls):
			if cname == "" and k["type"] == "identifier":
				cname = k["text"]
			if k["type"] == "class_body":
				body = k
		if cname == "" or body == null:
			continue
		var names = []
		for fn in C.named(body):
			if fn["type"] != "function_definition":
				continue
			var is_static = false
			for k2 in fn["children"]:
				if k2["type"] == "static_keyword":
					is_static = true
			if is_static:
				continue
			var fname = ""
			for k3 in C.named(fn):
				if k3["type"] == "identifier":
					fname = k3["text"]
					break
			if fname != "":
				names.append(fname)
		if names.size() > 0:
			script_instance_methods[cname] = names

	var m = {
		"className": null,
		"extends": null,
		"topStmts": [],
		"vars": [],
		"signals": [],
		"enums": [],
		"funcs": [],
		"innerClasses": [],
		"usesPackCodec": false,
	}
	for c in C.named(root):
		var t = c["type"]
		if t == "class_name_statement":
			var nm2 = C.field(c, "name")
			if nm2 == null:
				return err("missing-field", "class_name")
			m["className"] = nm2["text"]
		elif t == "extends_statement":
			var ex = _extends_text(c)
			if ex == null:
				return err("missing-field", "extends")
			m["extends"] = ex
		elif t == "variable_statement":
			var v = lower_var(c, false, idx)
			if failed:
				return null
			m["vars"].append(v)
		elif t == "const_statement":
			var v2 = lower_var(c, true, idx)
			if failed:
				return null
			m["vars"].append(v2)
		elif t == "signal_statement":
			var sg = lower_signal(c)
			if failed:
				return null
			m["signals"].append(sg)
		elif t == "enum_definition":
			var en = lower_enum(c)
			if failed:
				return null
			m["enums"].append(en)
		elif t == "function_definition":
			var fn2 = lower_func(c, idx)
			if failed:
				return null
			m["funcs"].append(fn2)
		elif t == "constructor_definition":
			var fn3 = lower_constructor(c, idx)
			if failed:
				return null
			m["funcs"].append(fn3)
		elif t == "class_definition":
			var cl = lower_class(c, idx)
			if failed:
				return null
			m["innerClasses"].append(cl)
		elif t == "annotation" or t == "comment":
			continue
		else:
			return err("module-node", "顶层节点 " + t + " 未支持")
	return m


static func _extends_text(c):
	var kids = C.named(c)
	for k in kids:
		if k["type"] == "type":
			return k["text"]
	var ty = C.field(c, "type")
	if ty != null:
		return ty["text"]
	for k2 in kids:
		if k2["type"] == "identifier" or k2["type"] == "string":
			return k2["text"]
	return null


static func lower_var(n, is_const, idx):
	var c = C.loc(n)
	var type_node = C.field(n, "type")
	var value_node = C.field(n, "value")
	var nm = C.field(n, "name")
	if nm == null:
		return err("missing-field", "变量名")
	var is_static = false
	var accessor = null
	for k in n["children"]:
		if k["type"] == "static_keyword":
			is_static = true
		if k["type"] == "setget":
			accessor = lower_accessor(k, idx)
			if failed:
				return null
	return {
		"name": nm["text"],
		"type": null if type_node == null else C.lower_type(type_node),
		"init": null if value_node == null else LE.lower_expr(value_node, idx),
		"isConst": is_const,
		"isStatic": is_static,
		"accessor": accessor,
		"loc": c,
	}


static func lower_accessor(n, idx):
	if n == null or n["type"] != "setget":
		return null
	var getter = null
	var setter = null
	for c in n["children"]:
		var t = c["type"]
		if t == "get_body":
			getter = {"kind": "inline", "body": _body_of(c, idx)}
			if failed:
				return null
		elif t == "set_body":
			var pname = ""
			for k in c["children"]:
				if k["type"] == "parameters":
					var ps = C.named(k)
					if ps.size() > 0:
						pname = ps[0]["text"]
			if pname == "":
				return err("property-setget", "set 访问器至少要一个参数名（实测形态是 set(value):）")
			setter = {"kind": "inline", "param": pname, "body": _body_of(c, idx)}
			if failed:
				return null
		elif t == "getter":
			getter = {"kind": "method", "method": c["text"]}
		elif t == "setter":
			setter = {"kind": "method", "method": c["text"]}
		elif c["isNamed"]:
			return err("property-setget", "属性访问器里没见过的形态：" + t)
	if getter == null and setter == null:
		return err("property-setget", "属性访问器既没有 get 也没有 set")
	return {"getter": getter, "setter": setter}


static func _body_of(c, idx):
	for k in c["children"]:
		if k["type"] == "body":
			return lower_body(k, idx)
	return []


static func lower_signal(n):
	var nm = C.field(n, "name")
	if nm == null:
		return err("missing-field", "信号名")
	var params_node = C.field(n, "parameters")
	var ps = [] if params_node == null else C.named(params_node)
	var texts = []
	var defaults = false
	for p in ps:
		texts.append(p["text"])
		if p["type"].ends_with("default_parameter"):
			defaults = true
	return {"name": nm["text"], "params": texts, "hasDefaults": defaults, "loc": C.loc(n)}


static func lower_enum(n):
	var name_node = C.field(n, "name")
	var list = C.field(n, "body")
	var members = []
	var nxt = 0
	if list != null:
		for en in C.named(list):
			var id_node = C.field(en, "left")
			var val_node = C.field(en, "right")
			if id_node == null:
				return err("missing-field", "枚举成员名")
			var value = nxt if val_node == null else val_node["text"].to_int()
			members.append({"name": id_node["text"], "value": value})
			nxt = value + 1
	return {"name": null if name_node == null else name_node["text"], "members": members, "loc": C.loc(n)}


static func lower_class(n, idx):
	var c = C.loc(n)
	var body = C.field(n, "body")
	var nm = C.field(n, "name")
	if body == null:
		return err("missing-field", "类体")
	if nm == null:
		return err("missing-field", "类名")
	var decl = {"name": nm["text"], "extends": null, "vars": [], "signals": [], "funcs": [], "innerClasses": [], "loc": c}
	for k in C.named(n):
		if k["type"] == "extends_statement":
			decl["extends"] = _extends_text(k)
	for k2 in C.named(body):
		var t = k2["type"]
		if t == "extends_statement":
			decl["extends"] = _extends_text(k2)
		elif t == "variable_statement" or t == "const_statement":
			var v = lower_var(k2, t == "const_statement", idx)
			if failed:
				return null
			decl["vars"].append(v)
		elif t == "signal_statement":
			var sg = lower_signal(k2)
			if failed:
				return null
			decl["signals"].append(sg)
		elif t == "function_definition":
			var fn = lower_func(k2, idx)
			if failed:
				return null
			decl["funcs"].append(fn)
		elif t == "constructor_definition":
			var fn2 = lower_constructor(k2, idx)
			if failed:
				return null
			decl["funcs"].append(fn2)
		elif t == "class_definition":
			var cl = lower_class(k2, idx)
			if failed:
				return null
			decl["innerClasses"].append(cl)
		elif t == "pass_statement" or t == "annotation" or t == "comment":
			continue
		else:
			return err("class-node", "类内节点 " + t + " 未支持")
	return decl


static func lower_func(n, idx):
	var nm = C.field(n, "name")
	if nm == null:
		return err("missing-field", "函数名")
	var params_node = C.field(n, "parameters")
	var ret_node = C.field(n, "return_type")
	var body_node = C.field(n, "body")
	var is_static = false
	for k in n["children"]:
		if k["type"] == "static_keyword":
			is_static = true
	var params = []
	if params_node != null:
		for p in C.named(params_node):
			var pr = lower_param(p, idx)
			if failed:
				return null
			params.append(pr)
	var body = []
	if body_node != null:
		body = lower_body(body_node, idx)
		if failed:
			return null
	return {"name": nm["text"], "params": params, "returnType": null if ret_node == null else C.lower_type(ret_node), "body": body, "coroutine": has_await(n), "isStatic": is_static, "loc": C.loc(n)}


static func lower_constructor(n, idx):
	var params_node = C.field(n, "parameters")
	var body_node = C.field(n, "body")
	var params = []
	if params_node != null:
		for p in C.named(params_node):
			var pr = lower_param(p, idx)
			if failed:
				return null
			params.append(pr)
	var body = []
	if body_node != null:
		body = lower_body(body_node, idx)
		if failed:
			return null
	return {"name": "_init", "params": params, "returnType": null, "body": body, "coroutine": false, "isStatic": false, "loc": C.loc(n)}


static func has_await(n):
	if n["type"] == "await_expression":
		return true
	for c in C.named(n):
		if has_await(c):
			return true
	return false


static func lower_param(n, idx):
	var id = null
	for c in C.named(n):
		if c["type"] == "identifier":
			id = c
			break
	var type_node = C.field(n, "type")
	var value_node = C.field(n, "value")
	var init = null
	if value_node != null:
		init = LE.lower_expr(value_node, idx)
	return {"name": n["text"] if id == null else id["text"], "type": null if type_node == null else C.lower_type(type_node), "default": init}


static func lower_body(n, idx):
	var out = []
	for c in C.named(n):
		if c["type"] == "comment":
			continue
		var s = lower_stmt(c, idx)
		if failed:
			return []
		out.append(s)
	return out


static func var_stmt(v, c):
	return {"kind": "var", "name": v["name"], "type": v["type"], "init": v["init"], "isConst": v["isConst"], "loc": c}


static func lower_stmt(n, idx):
	var c = C.loc(n)
	var t = n["type"]
	if t == "variable_statement":
		var v = lower_var(n, false, idx)
		if failed:
			return null
		return var_stmt(v, c)
	if t == "const_statement":
		var v2 = lower_var(n, true, idx)
		if failed:
			return null
		return var_stmt(v2, c)
	if t == "expression_statement":
		var kids = C.named(n)
		if kids.size() == 0:
			return err("empty-expr-stmt", "空表达式语句")
		var e = kids[0]
		if e["type"] == "assignment" or e["type"] == "augmented_assignment":
			return lower_stmt(e, idx)
		var ex = LE.lower_expr(e, idx)
		if ex == null or LE.is_error(ex):
			failed = true
			last_error = ex
			return null
		return {"kind": "expr", "expr": ex, "loc": c}
	if t == "assignment":
		var left = C.field(n, "left")
		var right = C.field(n, "right")
		if left == null:
			return err("missing-field", "赋值左值")
		if right == null:
			return err("missing-field", "赋值右值")
		var lt = LE.lower_expr(left, idx)
		var rv = LE.lower_expr(right, idx)
		if lt == null or rv == null or LE.is_error(lt) or LE.is_error(rv):
			failed = true
			last_error = lt if LE.is_error(lt) else rv
			return null
		return {"kind": "assign", "target": lt, "value": rv, "loc": c}
	if t == "augmented_assignment":
		var right_node = C.field(n, "right")
		var left_node = C.field(n, "left")
		if left_node == null:
			return err("missing-field", "赋值左值")
		if right_node == null:
			return err("missing-field", "赋值右值")
		var op = C.operator_of(n)
		if op.ends_with("="):
			op = op.substr(0, op.length() - 1)
		var left2 = LE.lower_expr(left_node, idx)
		var right2 = LE.lower_expr(right_node, idx)
		if left2 == null or right2 == null or LE.is_error(left2) or LE.is_error(right2):
			failed = true
			last_error = left2 if LE.is_error(left2) else right2
			return null
		return {"kind": "assign", "target": left2, "value": {"kind": "binary", "op": op, "left": left2, "right": right2, "loc": c}, "loc": c}
	if t == "return_statement":
		var kids2 = C.named(n)
		var val = null
		if kids2.size() > 0:
			val = LE.lower_expr(kids2[0], idx)
			if val == null or LE.is_error(val):
				failed = true
				last_error = val
				return null
		return {"kind": "return", "value": val, "loc": c}
	if t == "pass_statement":
		return {"kind": "pass", "loc": c}
	if t == "break_statement":
		return {"kind": "break", "loc": c}
	if t == "continue_statement":
		return {"kind": "continue", "loc": c}
	if t == "if_statement":
		return lower_if(n, idx)
	if t == "for_statement":
		var loop_var = C.field(n, "left")
		var iterable = C.field(n, "right")
		var var_type_node = C.field(n, "type")
		if loop_var == null:
			return err("missing-field", "循环变量")
		if iterable == null:
			return err("missing-field", "迭代对象")
		var it = LE.lower_expr(iterable, idx)
		if it == null or LE.is_error(it):
			failed = true
			last_error = it
			return null
		var body_node = C.field(n, "body")
		if body_node == null:
			return err("missing-field", "循环体")
		var body = lower_body(body_node, idx)
		if failed:
			return null
		return {"kind": "for", "var": loop_var["text"], "varType": null if var_type_node == null else C.lower_type(var_type_node), "iter": it, "body": body, "loc": c}
	if t == "while_statement":
		var cond_node = C.field(n, "condition")
		if cond_node == null:
			return err("missing-field", "循环条件")
		var cond = LE.lower_expr(cond_node, idx)
		if cond == null or LE.is_error(cond):
			failed = true
			last_error = cond
			return null
		var body_node2 = C.field(n, "body")
		if body_node2 == null:
			return err("missing-field", "循环体")
		var body2 = lower_body(body_node2, idx)
		if failed:
			return null
		return {"kind": "while", "cond": cond, "body": body2, "loc": c}
	if t == "match_statement":
		return lower_match(n, idx)
	return err("stmt", "语句 " + t + " 未支持")


static func lower_if(n, idx):
	var c = C.loc(n)
	var cond_node = C.field(n, "condition")
	if cond_node == null:
		return err("missing-field", "if 条件")
	var cond = LE.lower_expr(cond_node, idx)
	if cond == null or LE.is_error(cond):
		failed = true
		last_error = cond
		return null
	var body_node = C.field(n, "body")
	if body_node == null:
		return err("missing-field", "if 体")
	var body = lower_body(body_node, idx)
	if failed:
		return null
	var branches = [{"cond": cond, "body": body}]
	for alt in n["children"]:
		if alt["fieldName"] != "alternative":
			continue
		if alt["type"] == "elif_clause":
			var ec = C.field(alt, "condition")
			if ec == null:
				return err("missing-field", "elif 条件")
			var ecv = LE.lower_expr(ec, idx)
			if ecv == null or LE.is_error(ecv):
				failed = true
				last_error = ecv
				return null
			var eb = C.field(alt, "body")
			if eb == null:
				return err("missing-field", "elif 体")
			var ebody = lower_body(eb, idx)
			if failed:
				return null
			branches.append({"cond": ecv, "body": ebody})
		elif alt["type"] == "else_clause":
			var eb2 = C.field(alt, "body")
			if eb2 == null:
				return err("missing-field", "else 体")
			var ebody2 = lower_body(eb2, idx)
			if failed:
				return null
			branches.append({"cond": null, "body": ebody2})
		else:
			return err("if-alt", "if 分支 " + alt["type"] + " 未支持")
	return {"kind": "if", "branches": branches, "loc": c}


static func lower_match(n, idx):
	var c = C.loc(n)
	var subject_node = C.field(n, "value")
	if subject_node == null:
		return err("missing-field", "match 主题")
	var subject = LE.lower_expr(subject_node, idx)
	if subject == null or LE.is_error(subject):
		failed = true
		last_error = subject
		return null
	var body_node = C.field(n, "body")
	if body_node == null:
		return err("missing-field", "match 体")
	var arms = []
	for section in C.named(body_node):
		if section["type"] != "pattern_section":
			return err("match-node", "match 内节点 " + section["type"] + " 未支持")
		var sec_body_node = C.field(section, "body")
		if sec_body_node == null:
			return err("missing-field", "match 分支体")
		var sec_body = lower_body(sec_body_node, idx)
		if failed:
			return null
		var guard_node = null
		for x in C.named(section):
			if x["type"] == "pattern_guard":
				guard_node = x
		var guard = null
		if guard_node != null:
			var gc = C.field(guard_node, "condition")
			if gc == null:
				var gn = C.named(guard_node)
				gc = null if gn.is_empty() else gn[0]
			if gc == null:
				return err("missing-field", "when 条件")
			guard = LE.lower_expr(gc, idx)
			if guard == null or LE.is_error(guard):
				failed = true
				last_error = guard
				return null
		for p in C.named(section):
			if p == guard_node or p["type"] == "body":
				continue
			var pat = lower_pattern(p, idx)
			if failed:
				return null
			arms.append({"pattern": pat, "guard": guard, "body": sec_body})
	return {"kind": "match", "subject": subject, "arms": arms, "loc": c}


static func lower_pattern(n, idx):
	var t = n["type"]
	if t == "pattern_binding":
		var kids = C.named(n)
		return {"kind": "bind", "name": n["text"] if kids.is_empty() else kids[0]["text"]}
	if t == "identifier":
		if n["text"] == "_":
			return {"kind": "wildcard"}
		return _const_pattern(n, idx)
	if t == "attribute":
		if arm_self_base(n):
			return err("pattern-arm-runtime", ARM_PATTERN)
		var aparts = C.named(n)
		var head = aparts[0] if aparts.size() > 0 else null
		var tail = aparts[1] if aparts.size() > 1 else null
		var mname = ""
		if aparts.size() == 2 and tail != null and tail["type"] == "attribute_call":
			var tn = C.named(tail)
			mname = "" if tn.is_empty() else tn[0]["text"]
		if mname != "" and head != null and head["type"] == "identifier" and script_instance_methods.has(head["text"]) and has_name(script_instance_methods[head["text"]], mname):
			return err("pattern-arm-instance-method", "Cannot call non-static function \"" + mname + "()\" on the class \"" + head["text"] + "\" directly. Make an instance instead.")
		return _const_pattern(n, idx)
	if t == "integer":
		return {"kind": "lit", "lit": "int", "value": LI.lower_int_lit(n["text"])}
	if t == "float":
		return {"kind": "lit", "lit": "float", "value": DB.parse_gd_double(n["text"])}
	if t == "string":
		return {"kind": "lit", "lit": "string", "value": LI.unquote(n["text"])}
	if t == "string_name":
		return {"kind": "lit", "lit": "string_name", "value": LI.unquote(LI.strip_amp(n["text"]))}
	if t == "node_path":
		return {"kind": "lit", "lit": "node_path", "value": LI.unquote(LI.strip_caret(n["text"]))}
	if t == "call":
		var np = node_path_arm(n)
		if np != null:
			return {"kind": "lit", "lit": "node_path", "value": np}
		if ctor_arm(n):
			return _const_pattern(n, idx)
		var gname = C.named(n)[0]["text"] if C.named(n).size() > 0 else ""
		if gname != "" and has_name(ARM_FOLD_GLOBALS, gname) and arm_fold_arity_fits(gname, call_args(n)) and _all_literals(call_args(n)):
			return _const_pattern(n, idx)
		if gname != "" and has_name(script_func_names, gname):
			return err("pattern-arm-runtime", ARM_PATTERN)
		var sig = arm_signature(n)
		if sig != null:
			var joined = ""
			for s in sig:
				joined += s + "\n"
			return err("pattern-arm-signature", joined + ARM_PATTERN)
		if gname != "" and has_key(G.CALLABLES, gname):
			var gb = G.CALLABLES[gname]
			var given = call_args(n).size()
			if gb != null and (given < gb[0] or given > gb[1]):
				return err("pattern-arm-arity", arm_arity_say(gb[0], gb[1], given, gname) + "\n" + ARM_PATTERN)
			return err("pattern-arm-runtime", ARM_PATTERN)
		if arm_callee_known(n):
			return err("pattern-arm-runtime", ARM_PATTERN)
		return err("pattern", "模式 call 未支持")
	if t == "subscript":
		return err("pattern-arm-parse", "Expected \":\" or \"when\" after \"match\" patterns.")
	if t == "true":
		return {"kind": "lit", "lit": "bool", "value": true}
	if t == "false":
		return {"kind": "lit", "lit": "bool", "value": false}
	if t == "null":
		return {"kind": "lit", "lit": "null", "value": null}
	if t == "array":
		var items = []
		for kid in C.named(n):
			var it = lower_pattern(kid, idx)
			if failed:
				return null
			items.append(it)
		return {"kind": "array", "items": items}
	if t == "dictionary":
		var entries = []
		for pair in C.named(n):
			var left = C.field(pair, "left")
			if left == null:
				var pn = C.named(pair)
				left = null if pn.is_empty() else pn[0]
			var right = C.field(pair, "value")
			if right == null:
				var pv = C.named(pair)
				right = null if pv.size() < 2 else pv[1]
			if left == null or right == null:
				return err("missing-field", "字典键值")
			var key = LE.lower_expr(left, idx)
			if key == null or LE.is_error(key):
				failed = true
				last_error = key
				return null
			var pat = lower_pattern(right, idx)
			if failed:
				return null
			entries.append({"key": key, "pattern": pat})
		return {"kind": "dict", "entries": entries}
	if t == "binary_operator" or t == "unary_operator" or t == "parenthesized_expression" or t == "conditional_expression":
		if arm_all_literals(n):
			return _const_pattern(n, idx)
		if arm_has_attribute_leaf(n):
			return err("pattern-arm-runtime", ARM_PATTERN)
		return err("pattern", "模式 " + t + " 未支持")
	return err("pattern", "模式 " + t + " 未支持")


static func _const_pattern(n, idx):
	var ex = LE.lower_expr(n, idx)
	if ex == null or LE.is_error(ex):
		failed = true
		last_error = ex
		return null
	return {"kind": "const", "expr": ex}


static func arm_all_literals(n):
	var t = n["type"]
	if t == "binary_operator" or t == "unary_operator" or t == "parenthesized_expression" or t == "conditional_expression":
		var kids = C.named(n)
		if kids.is_empty():
			return false
		for k in kids:
			if not arm_all_literals(k):
				return false
		return true
	return has_name(ARM_LITERAL_NODES, t)


static func _all_literals(nodes):
	for x in nodes:
		if not arm_all_literals(x):
			return false
	return true


static func arm_self_base(n):
	var kids = C.named(n)
	return kids.size() > 0 and kids[0]["type"] == "identifier" and kids[0]["text"] == "self"


static func arm_has_attribute_leaf(n):
	if n["type"] == "attribute":
		return true
	if n["type"] == "binary_operator" or n["type"] == "unary_operator" or n["type"] == "parenthesized_expression" or n["type"] == "conditional_expression":
		for k in C.named(n):
			if arm_has_attribute_leaf(k):
				return true
	return false


static func arm_arg_kind(n):
	var t = n["type"]
	if t == "integer":
		return "int"
	if t == "float":
		return "float"
	if t == "string":
		return "String"
	if t == "string_name":
		return "StringName"
	if t == "node_path":
		return "NodePath"
	if t == "true" or t == "false":
		return "bool"
	if t == "unary_operator":
		if n["text"].substr(0, 1) != "-":
			return null
		var inner = C.named(n)
		if inner.size() != 1:
			return null
		var k = arm_arg_kind(inner[0])
		return k if (k == "int" or k == "float") else null
	if t == "call":
		var callee = C.named(n)[0] if C.named(n).size() > 0 else null
		if callee == null or callee["type"] != "identifier":
			return null
		var kinds = []
		for a in call_args(n):
			kinds.append(arm_arg_kind(a))
		if not ctor_accepts(callee["text"], kinds):
			return null
		return callee["text"]
	return null


static func call_args(n):
	var args_node = C.field(n, "arguments")
	return [] if args_node == null else C.named(args_node)


static func ctor_accepts(name, kinds):
	if not has_key(G.CTOR_ARMS, name):
		return false
	var rows = G.CTOR_ARMS[name]
	var args = kinds.size()
	if args == 0:
		for row in rows:
			if row.size() == 0:
				return true
		return false
	for row2 in rows:
		if row2.size() != args:
			continue
		var ok = true
		for i in args:
			if not slot_for_k(kinds[i], row2[i]):
				ok = false
				break
		if ok:
			return true
	return false


static func slot_for_k(kind, slot):
	if kind == null:
		return false
	if slot == "N":
		return kind == "int" or kind == "float"
	if slot == "I":
		return kind == "int"
	if slot == "B":
		return kind == "int" or kind == "float" or kind == "bool"
	if slot == "S":
		return kind == "String"
	if slot == "V2":
		return kind == "Vector2"
	if slot == "V2I":
		return kind == "Vector2i"
	if slot == "R2":
		return kind == "Rect2"
	if slot == "R2I":
		return kind == "Rect2i"
	if slot == "V3":
		return kind == "Vector3"
	return kind == slot


static func ctor_arm(n):
	var callee = C.named(n)[0] if C.named(n).size() > 0 else null
	if callee == null or callee["type"] != "identifier":
		return false
	var kinds = []
	for a in call_args(n):
		kinds.append(arm_arg_kind(a))
	return ctor_accepts(callee["text"], kinds)


static func arm_arity_say(min_n, max_n, given, name):
	if given < min_n:
		return "Too few arguments for \"" + name + "()\" call. Expected at least " + str(min_n) + " but received " + str(given) + "."
	return "Too many arguments for \"" + name + "()\" call. Expected at most " + str(max_n) + " but received " + str(given) + "."


static func arm_fold_arity_fits(name, args):
	if not has_key(G.CALLABLES, name):
		return true
	var row = G.CALLABLES[name]
	if row == null:
		return true
	return args.size() >= row[0] and args.size() <= row[1]


static func arm_callee_known(n):
	var callee = C.named(n)[0] if C.named(n).size() > 0 else null
	if callee == null or callee["type"] != "identifier":
		return false
	return has_key(G.CTOR_ARMS, callee["text"]) or has_name(ARM_NO_CTOR, callee["text"])


static func arm_signature(n):
	var callee = C.named(n)[0] if C.named(n).size() > 0 else null
	if callee == null or callee["type"] != "identifier":
		return null
	var args = call_args(n)
	var kinds = []
	var inner = []
	for a in args:
		var k = arm_arg_kind(a)
		if k != null:
			kinds.append(k)
			continue
		var sub = arm_signature(a) if a["type"] == "call" else null
		if sub == null:
			return null
		var nested = C.named(a)[0] if C.named(a).size() > 0 else null
		if nested == null or nested["type"] != "identifier":
			return null
		for s in sub:
			inner.append(s)
		kinds.append(nested["text"])
	if ctor_accepts(callee["text"], kinds):
		return null
	if args.size() == 0:
		return null
	if not has_key(G.CTOR_ARMS, callee["text"]) and not has_name(ARM_NO_CTOR, callee["text"]):
		if not has_key(G.CALLABLES, callee["text"]):
			return ["Function \"" + callee["text"] + "()\" not found in base self."]
		return null
	var sig = []
	for s2 in inner:
		sig.append(s2)
	var kinds_text = ""
	for i in kinds.size():
		if i > 0:
			kinds_text += ", "
		kinds_text += kinds[i]
	sig.append("No constructor of \"" + callee["text"] + "\" matches the signature \"" + callee["text"] + "(" + kinds_text + ")\".")
	return sig


static func node_path_arm(n):
	var callee = C.named(n)[0] if C.named(n).size() > 0 else null
	if callee == null or callee["type"] != "identifier" or callee["text"] != "NodePath":
		return null
	var args_node = C.field(n, "arguments")
	if args_node == null:
		return null
	var args = C.named(args_node)
	if args.size() != 1:
		return null
	var only = args[0]
	if only["type"] != "string":
		return null
	return LI.unquote(only["text"])
