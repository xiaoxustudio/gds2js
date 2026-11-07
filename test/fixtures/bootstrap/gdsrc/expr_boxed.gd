const NF = preload("res://numfmt.gd")
const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")
const AB = preload("res://abi.gd")
const IRF = preload("res://ir.gd")
const AZ = preload("res://analyze_idx.gd")
const O = preload("res://op_tables.gd")

const SAFE_INT = 9007199254740991


static func emit_lit(lit, value):
	if lit == "int":
		if typeof(value) == TYPE_STRING:
			return "rt.V.int(" + value + "n)"
		var text = str(value)
		if typeof(value) == TYPE_INT and (value > SAFE_INT or value < -SAFE_INT):
			return "rt.V.int(" + text + "n)"
		return "rt.V.int(" + text + ")"
	if lit == "float":
		return "rt.V.float(" + NF.js_num_text(value) + ")"
	if lit == "string":
		return "rt.V.str(" + HE.json_quote(value) + ")"
	if lit == "string_name":
		return "rt.V.stringName(" + HE.json_quote(value) + ")"
	if lit == "node_path":
		return "rt.nodePathCtor([rt.V.str(" + HE.json_quote(value) + ")])"
	if lit == "bool":
		return "rt.V.bool(" + str(value) + ")"
	return "rt.V.nil()"


static func box_r(r):
	if r["rep"] == "int":
		return "rt.V.int(" + r["code"] + ")"
	if r["rep"] == "float":
		return "rt.V.float(" + r["code"] + ")"
	if r["rep"] == "str":
		return "rt.V.str(" + r["code"] + ")"
	if r["rep"] == "bool":
		return "rt.V.bool(" + r["code"] + ")"
	return r["code"]


static func emit_expr(e):
	return box_r(emit_expr_r(e))


static func emit_expr_safe(e):
	var r = emit_expr_r(e)
	if r is Dictionary and r.has("__error"):
		return r
	return box_r(r)


static func _an_label(e):
	if CTX.get_analysis() == null:
		return null
	return AZ.pos_read_label(CTX.get_analysis(), e)


static func _an_dict_int(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_dict_int_read(CTX.get_analysis(), e)


static func emit_expr_r(e):
	var kind = e.get("kind")
	if kind == "ternary":
		var cr = emit_expr_r(e["cond"])
		var tr = emit_expr_r(e["thenE"])
		var fr = emit_expr_r(e["elseE"])
		return {"code": "rt.tern(" + box_r(cr) + ", () => " + box_r(tr) + ", () => " + box_r(fr) + ")", "rep": "var"}
	if kind == "lit" and e.get("lit") == "int" and typeof(e.get("value")) == TYPE_INT and absi(e["value"]) <= SAFE_INT:
		return {"code": str(e["value"]), "rep": "int"}
	if kind == "lit" and e.get("lit") == "float" and (typeof(e.get("value")) == TYPE_FLOAT or typeof(e.get("value")) == TYPE_INT):
		return {"code": NF.js_num_text(e["value"]), "rep": "float"}
	if kind == "lit" and e.get("lit") == "string":
		return {"code": HE.json_quote(e["value"]), "rep": "str"}
	if kind == "ident":
		var k = CTX.ctx["UNBOXED"].get(e["name"])
		if k != null:
			return {"code": e["name"], "rep": k}
	if kind == "index" and e["obj"].get("kind") == "index" and e["obj"]["obj"].get("kind") == "ident":
		var ek = CTX.ctx["RAW_ARRAYS"].get(e["obj"]["obj"]["name"])
		if ek != null and AB.is_grid_elem(ek):
			var ri = emit_expr_r(e["obj"]["index"])
			var rj = emit_expr_r(e["index"])
			if ri["rep"] != "int" or rj["rep"] != "int":
				return _raw_error("raw-array", "内部不变量破坏：裸网格下标期望 int，实得 " + ri["rep"] + "/" + rj["rep"])
			return {"code": "rt.fast.rawArrGet" + HE.fast_suffix(ek) + "2(" + e["obj"]["obj"]["name"] + ", " + ri["code"] + ", " + rj["code"] + ")", "rep": AB.leaf_of(ek)}
	if kind == "index" and e["obj"].get("kind") == "ident":
		var ek2 = CTX.ctx["RAW_ARRAYS"].get(e["obj"]["name"])
		if ek2 != null and not AB.is_grid_elem(ek2):
			var ir = emit_expr_r(e["index"])
			if ir["rep"] != "int":
				return _raw_error("raw-array", "内部不变量破坏：裸数组下标期望 int，实得 " + ir["rep"])
			var lbl = _an_label(e)
			var tail = "" if lbl == null else ", " + JSON.stringify(lbl)
			var suffix = "Base" if lbl != null else ""
			return {"code": "rt.fast.rawArrGet" + HE.fast_suffix(ek2) + suffix + "(" + e["obj"]["name"] + ", " + ir["code"] + tail + ")", "rep": ek2}
		var dk = CTX.ctx["RAW_DICTS"].get(e["obj"]["name"])
		if dk != null and not _an_dict_int(e):
			var kr = emit_expr_r(e["index"])
			if kr["rep"] != "int" and kr["rep"] != "str":
				return _raw_error("raw-dict-key", "内部不变量破坏：裸字典键期望 int/str，实得 " + kr["rep"])
			return {"code": "rt.fast.rawDictGet(" + e["obj"]["name"] + ", " + kr["code"] + ")", "rep": dk}
	if kind == "call" and e["callee"].get("kind") == "attribute" and e["callee"]["obj"].get("kind") == "ident":
		var nm = e["callee"]["obj"]["name"]
		var ek3 = CTX.ctx["RAW_ARRAYS"].get(nm)
		var dk3 = CTX.ctx["RAW_DICTS"].get(nm)
		var cname = e["callee"].get("name")
		var argc = e["args"].size()
		if (ek3 != null or dk3 != null) and (cname == "size" or cname == "length") and argc == 0:
			return {"code": nm + ("." + ("length" if ek3 != null else "size")), "rep": "int"}
		if ek3 != null and (cname == "append" or cname == "push_back") and argc == 1:
			var er = emit_expr_r(e["args"][0])
			if er["rep"] != ek3:
				return _raw_error("raw-array", "内部不变量破坏：裸数组 " + cname + " 元素期望 " + ek3 + "，实得 " + er["rep"])
			return {"code": nm + ".push(" + er["code"] + ")", "rep": "var"}
		if ek3 != null and cname == "reverse" and argc == 0:
			return {"code": nm + ".reverse()", "rep": "var"}
		if ek3 != null and cname == "push_front" and argc == 1:
			var er2 = emit_expr_r(e["args"][0])
			if er2["rep"] != ek3:
				return _raw_error("raw-array", "内部不变量破坏：裸数组 push_front 元素期望 " + ek3 + "，实得 " + er2["rep"])
			return {"code": "rt.fast.rawArrPushFront" + HE.fast_suffix(ek3) + "(" + nm + ", " + er2["code"] + ")", "rep": "var"}
		if ek3 != null and cname == "fill" and argc == 1:
			var er3 = emit_expr_r(e["args"][0])
			if er3["rep"] != ek3:
				return _raw_error("raw-array", "内部不变量破坏：裸数组 fill 元素期望 " + ek3 + "，实得 " + er3["rep"])
			return {"code": nm + ".fill(" + er3["code"] + ")", "rep": "var"}
		if ek3 != null and cname == "insert" and argc == 2:
			var ir2 = emit_expr_r(e["args"][0])
			var vr = emit_expr_r(e["args"][1])
			if ir2["rep"] != "int":
				return _raw_error("raw-array", "内部不变量破坏：裸数组 insert 下标期望 int，实得 " + ir2["rep"])
			if vr["rep"] != ek3:
				return _raw_error("raw-array", "内部不变量破坏：裸数组 insert 元素期望 " + ek3 + "，实得 " + vr["rep"])
			return {"code": "rt.fast.rawArrInsert" + HE.fast_suffix(ek3) + "(" + nm + ", " + ir2["code"] + ", " + vr["code"] + ")", "rep": "int"}
		if ek3 != null and cname == "remove_at" and argc == 1:
			var ir3 = emit_expr_r(e["args"][0])
			if ir3["rep"] != "int":
				return _raw_error("raw-array", "内部不变量破坏：裸数组 remove_at 下标期望 int，实得 " + ir3["rep"])
			return {"code": "rt.fast.rawArrRemoveAt" + HE.fast_suffix(ek3) + "(" + nm + ", " + ir3["code"] + ")", "rep": "var"}
		if ek3 != null and cname == "clear" and argc == 0:
			return {"code": "rt.fast.rawArrClear" + HE.fast_suffix(ek3) + "(" + nm + ")", "rep": "var"}
		if ek3 != null and cname == "pop_back" and argc == 0:
			return {"code": nm + ".pop()", "rep": "var"}
		if ek3 != null and cname == "pop_front" and argc == 0:
			return {"code": nm + ".shift()", "rep": "var"}
		if ek3 != null and cname == "pop_at" and argc == 1:
			var ir4 = emit_expr_r(e["args"][0])
			if ir4["rep"] != "int":
				return _raw_error("raw-array", "内部不变量破坏：裸数组 pop_at 下标期望 int，实得 " + ir4["rep"])
			return {"code": "rt.fast.rawArrRemoveAt" + HE.fast_suffix(ek3) + "(" + nm + ", " + ir4["code"] + ")", "rep": "var"}
		if dk3 != null and cname == "get" and argc == 2:
			var kr2 = emit_expr_r(e["args"][0])
			var dr = emit_expr_r(e["args"][1])
			if kr2["rep"] != "int" and kr2["rep"] != "str":
				return _raw_error("raw-dict-key", "内部不变量破坏：裸字典 get 键期望 int/str，实得 " + kr2["rep"])
			if dr["rep"] != dk3:
				return _raw_error("raw-dict-get", "内部不变量破坏：裸字典 get 默认值期望 " + dk3 + "，实得 " + dr["rep"])
			return {"code": "rt.fast.rawDictGetOr" + HE.fast_suffix(dk3) + "(" + nm + ", " + kr2["code"] + ", " + dr["code"] + ")", "rep": dk3}
	if kind == "call" and e["callee"].get("kind") == "ident":
		var abi = CTX.ctx["RAW_ABIS"].get(e["callee"]["name"])
		if abi != null:
			if e["args"].size() != abi["params"].size():
				return _raw_error("raw-abi-arity", "内部不变量破坏：" + e["callee"]["name"] + " 期望 " + str(abi["params"].size()) + " 个实参")
			var raws = []
			for a in e["args"]:
				raws.append(emit_expr_r(a))
			for i in raws.size():
				if raws[i]["rep"] != abi["params"][i]:
					return _raw_error("raw-abi-arg", "内部不变量破坏：" + e["callee"]["name"] + " 第 " + str(i + 1) + " 参数期望 " + abi["params"][i] + "，实得 " + raws[i]["rep"])
			var codes = []
			for r in raws:
				codes.append(r["code"])
			return {"code": "this." + e["callee"]["name"] + "(" + ", ".join(codes) + ")", "rep": abi["ret"]}
	if kind == "unary" and e.get("op") == "-":
		var orr = emit_expr_r(e["operand"])
		if orr["rep"] == "int" or orr["rep"] == "float":
			return {"code": "(-" + orr["code"] + ")", "rep": orr["rep"]}
	if kind == "binary":
		var raw = load("res://abi.gd").try_raw_binary(e)
		if raw != null:
			return raw
	return {"code": emit_expr_var(e), "rep": "var"}


static func _raw_error(code, message):
	return {"__error": code, "message": message}


static func _an_global_read(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_global_value_read(CTX.get_analysis(), e)


static func _an_native_read(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_native_class_read(CTX.get_analysis(), e)


static func _an_host_read(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_host_method_read(CTX.get_analysis(), e)


static func _an_engine_read(e):
	if CTX.get_analysis() == null:
		return false
	return AZ.is_engine_prop_read(CTX.get_analysis(), e)


static func _an_bound(e):
	if CTX.get_analysis() == null:
		return null
	return AZ.bound_face(CTX.get_analysis(), e)


static func _an_caps(e):
	if CTX.get_analysis() == null:
		return []
	return AZ.lambda_capture_names_of(CTX.get_analysis(), e)


static func emit_expr_var(e):
	var kind = e.get("kind")
	if kind == "lit":
		return emit_lit(e["lit"], e.get("value"))
	if kind == "ident":
		if e["name"] == "self":
			return "rt.V.nil()" if CTX.ctx["selfInNilContext"] else "rt.V.object(this)"
		var fwd = CTX.ctx["STATIC_FORWARD_DEFAULTS"].get(e["name"])
		if fwd != null:
			return fwd
		var owner = CTX.ctx["CLASS_VALUE_OWNERS"].get(e["name"])
		if owner != null:
			return owner + "." + e["name"]
		if CTX.ctx["INNER_CLASSES"].has(e["name"]) or e["name"] == CTX.ctx["CURRENT_CLASS"]:
			return "rt.V.object(__gd_d_" + e["name"] + ")"
		if CTX.ctx["STATIC_FUNCS"].has(e["name"]):
			return "rt.methodCallable(rt.V.object(__gd_d_" + CTX.ctx["CURRENT_CLASS"] + "), " + JSON.stringify(e["name"]) + ")"
		if CTX.ctx["MODULE_FUNCS"].has(e["name"]):
			return "rt.methodCallable(rt.V.object(this), " + JSON.stringify(e["name"]) + ")"
		if CTX.ctx["CURRENT_MEMBERS"].has(e["name"]):
			return "rt.wrapValue(this." + e["name"] + ")" if CTX.ctx["CLASS_SIGNALS"].has(e["name"]) else "this." + e["name"]
		if CTX.ctx["MODULE_VARS"].has(e["name"]):
			return "rt.wrapValue(this." + e["name"] + ")" if CTX.ctx["MODULE_SIGNALS"].has(e["name"]) else "this." + e["name"]
		if _an_global_read(e):
			return "rt.globalCallable(" + JSON.stringify(e["name"]) + ")"
		if _an_native_read(e):
			return "rt.nativeClass(" + JSON.stringify(e["name"]) + ")"
		if _an_host_read(e) and not CTX.ctx["FUNC_BINDS"].has(e["name"]):
			return "rt.methodCallable(rt.V.object(this), " + JSON.stringify(e["name"]) + ")"
		if _an_engine_read(e):
			return "rt.wrapValue(rt.attribute(rt.V.object(this), " + JSON.stringify(e["name"]) + "))"
		return e["name"]
	if kind == "unary":
		var op = e.get("op")
		if op == "not":
			return "rt.V.bool(!rt.ops.truthy(" + emit_expr(e["operand"]) + "))"
		if op == "-":
			return "rt.ops.neg(" + emit_expr(e["operand"]) + ")"
		if op == "+":
			return "rt.ops.pos(" + emit_expr(e["operand"]) + ")"
		if op == "~":
			return "rt.ops.bnot(" + emit_expr(e["operand"]) + ")"
		return _raw_error("emit-unary", "一元运算符 " + str(op) + " 还没实现")
	if kind == "await":
		return "(await rt.awaitValue(" + emit_expr(e["operand"]) + "))"
	if kind == "ternary":
		return "rt.tern(" + emit_expr(e["cond"]) + ", () => " + emit_expr(e["thenE"]) + ", () => " + emit_expr(e["elseE"]) + ")"
	if kind == "binary":
		return load("res://call.gd").emit_binary(e)
	if kind == "array":
		var items = []
		for it in e["items"]:
			items.append(emit_expr(it))
		return "rt.V.array(rt.GArray.of([" + ", ".join(items) + "]))"
	if kind == "dict":
		var pairs = []
		for en in e["entries"]:
			pairs.append("[" + emit_expr(en["key"]) + ", " + emit_expr(en["value"]) + "]")
		return "rt.dictOf([" + ", ".join(pairs) + "])"
	if kind == "index":
		if _an_dict_int(e):
			return "rt.wrapValue(rt.dictIndexInt(" + emit_expr(e["obj"]) + ", " + emit_expr(e["index"]) + "))"
		var pos = _an_label(e)
		if pos == null:
			return "rt.wrapValue(rt.index(" + emit_expr(e["obj"]) + ", " + emit_expr(e["index"]) + "))"
		return "rt.wrapValue(rt.index(" + emit_expr(e["obj"]) + ", " + emit_expr(e["index"]) + ", " + JSON.stringify(pos) + "))"
	if kind == "attribute":
		if e["obj"].get("kind") == "ident" and e["obj"]["name"] == "super":
			return _raw_error("emit-super-prop", "super.属性 访问还没实现（只支持 super.method()）")
		if e["obj"].get("kind") == "ident":
			var shared = CTX.ctx["PRELOAD_FACE_OWNERS"].get(e["obj"]["name"])
			if shared != null and shared["names"].has(e["name"]):
				return shared["cls"] + "." + e["name"]
		if e["obj"].get("kind") == "ident" and e["obj"]["name"] == "self":
			if CTX.ctx["CURRENT_MEMBERS"].has(e["name"]) or CTX.ctx["MODULE_VARS"].has(e["name"]) or CTX.ctx["MODULE_FUNCS"].has(e["name"]):
				return emit_expr_var({"kind": "ident", "name": e["name"], "loc": e["loc"]})
			return "rt.wrapValue(rt.attribute(rt.V.object(this), " + JSON.stringify(e["name"]) + "))"
		var static_fn = IRF.static_member_fn(e["obj"])
		if static_fn != null:
			return "rt." + static_fn + "(" + JSON.stringify(e["name"]) + ")"
		if e["obj"].get("kind") == "ident" and CTX.ctx["ENUM_NAMES"].has(e["obj"]["name"]):
			return "rt.wrapValue(rt.index(" + e["obj"]["name"] + ", rt.V.str(" + JSON.stringify(e["name"]) + ")))"
		if e["obj"].get("kind") == "ident":
			var vals = CTX.ctx["CLASS_VALUES"].get(e["obj"]["name"])
			if vals != null and vals.has(e["name"]):
				return e["obj"]["name"] + "." + e["name"]
		var bound = _an_bound(e)
		if bound != null:
			return "rt.wrapValue(rt.boundMethod(" + emit_expr(e["obj"]) + ", " + JSON.stringify(bound["face"]) + ", " + JSON.stringify(e["name"]) + ", " + str(bound["min"]) + ", " + str(bound["max"]) + "))"
		if e["obj"].get("kind") == "ident" and _an_native_read(e["obj"]):
			var row = null
			var faces = O.ENGINE_CLASS_FACES.get(e["obj"]["name"])
			if faces != null:
				for r in faces:
					if r[0] == e["name"]:
						row = r
						break
			if row != null:
				return "rt.nativeClassNew(" + JSON.stringify(e["obj"]["name"]) + ", " + str(row[1]) + ")"
		return "rt.wrapValue(rt.attribute(" + emit_expr(e["obj"]) + ", " + JSON.stringify(e["name"]) + "))"
	if kind == "lambda":
		return _emit_lambda(e)
	if kind == "call":
		return load("res://call.gd").emit_call(e)
	if kind == "is":
		return "rt.isType(" + emit_expr(e["operand"]) + ", " + JSON.stringify(HE.type_name(e["type"])) + ")"
	if kind == "as":
		return "rt.asType(" + emit_expr(e["operand"]) + ", " + JSON.stringify(HE.type_name(e["type"])) + ")"
	return _raw_error("emit-expr", "表达式 " + str(kind) + " 还没实现")


static func _emit_lambda(e):
	var first_def = -1
	for i in e["params"].size():
		if e["params"][i].get("default") != null:
			first_def = i
			break
	if first_def >= 0:
		for i in range(first_def, e["params"].size()):
			if e["params"][i].get("default") == null:
				return _raw_error("lambda-param-default", "lambda 的默认值形参排在必填形参之前那一形没实测过，不发")
	var defs = []
	for p in e["params"]:
		if p.get("default") != null:
			defs.append(p["default"])
	for d in defs:
		if d.get("kind") == "lambda":
			return _raw_error("lambda-param-default", "默认值那一位直接放 lambda 的形况没实测过，不发")
	var lpad = "        "
	var body = []
	var ST = load("res://emit_stmt.gd")
	for st in e["body"]:
		CTX.ctx["LAMBDA_DEPTH"] += 1
		for l in ST.emit_stmt(st, false):
			body.append(lpad + l)
		CTX.ctx["LAMBDA_DEPTH"] -= 1
	var bind = []
	for i in e["params"].size():
		var p2 = e["params"][i]
		var line = lpad + "const " + p2["name"] + " = __a[" + str(i) + "] as rt.Variant"
		if p2.get("default") != null:
			line = line + " ?? " + emit_expr(p2["default"])
		bind.append(line + ";")
	var lines = []
	lines.append("rt.callable((__a: rt.Variant[]) => {")
	lines.append("        const __gd_frame = rt.frameEnter(" + JSON.stringify(CTX.ctx["DEBUG_FILE"]) + ", \"<anonymous lambda>\");")
	lines.append("        try {")
	for l2 in bind:
		lines.append("  " + l2)
	for l3 in body:
		lines.append("  " + l3)
	lines.append("        } catch (__gd_err) {")
	lines.append("          rt.gdFunctionError(__gd_err);")
	lines.append("          return rt.V.nil();")
	lines.append("        } finally {")
	lines.append("          rt.frameExit(__gd_frame);")
	lines.append("        }")
	var tail = "    }, " + str(e["params"].size())
	if defs.size() > 0:
		tail = tail + ", " + str(defs.size())
	lines.append(tail + ")")
	var inner = "\n".join(lines)
	var caps = _an_caps(e)
	if caps.size() > 0:
		return "(((" + ", ".join(caps) + ") => " + inner + "))(" + ", ".join(caps) + ")"
	return inner


static func emit_value_write(target, value):
	var seq = {"n": 0}
	if target.get("kind") == "attribute":
		var p = HE.write_path_for(target["obj"], seq)
		return HE.write_back(p, "rt.writeProp(" + p["read"] + ", " + JSON.stringify(target["name"]) + ", " + emit_expr(value) + ")")
	if target.get("kind") == "index":
		var p2 = HE.write_path_for(target["obj"], seq)
		return HE.write_back(p2, "rt.writeIdx(" + p2["read"] + ", " + emit_expr(target["index"]) + ", " + emit_expr(value) + ")")
	return null


static func emit_assign(target, value, value_expr = null):
	if target.get("kind") == "ident":
		var ann = CTX.ctx["LOCAL_TYPES"].get(target["name"])
		var cast = AB.declared_cast(ann)
		var v = value
		if value_expr != null:
			v = AB.container_slot(value, value_expr, HE.container_ann_text(ann), "assignContainer")
		var lhs = emit_expr(target)
		if cast != null:
			return lhs + " = " + cast + "(" + v + ");"
		return lhs + " = " + v + ";"
	if target.get("kind") == "index":
		if target["obj"].get("kind") == "ident" and CTX.ctx["RAW_ARRAYS"].has(target["obj"]["name"]):
			return _raw_error("raw-array", "内部不变量破坏：裸数组不应出现下标赋值")
		return "rt.setIndex(" + emit_expr(target["obj"]) + ", " + emit_expr(target["index"]) + ", " + value + ");"
	if target.get("kind") == "attribute":
		return "rt.writeProp(" + emit_expr(target["obj"]) + ", " + JSON.stringify(target["name"]) + ", " + value + ");"
	return _raw_error("emit-assign", "赋值目标 " + str(target.get("kind")) + " 还没实现")


static func emit_pattern(p):
	var kind = p.get("kind")
	if kind == "wildcard":
		return "rt.patWild()"
	if kind == "bind":
		return "rt.patBind()"
	if kind == "lit":
		return "rt.patLit(" + emit_lit(p["lit"], p.get("value")) + ")"
	if kind == "const":
		return "rt.patConst(" + emit_expr(p["expr"]) + ")"
	if kind == "array":
		var items = []
		for it in p["items"]:
			items.append(emit_pattern(it))
		return "rt.patArray([" + ", ".join(items) + "])"
	if kind == "dict":
		var entries = []
		for en in p["entries"]:
			entries.append("[" + emit_expr(en["key"]) + ", " + emit_pattern(en["pattern"]) + "]")
		return "rt.patDict([" + ", ".join(entries) + "])"
	return null
