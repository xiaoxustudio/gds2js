const CTX = preload("res://context.gd")
const SCRIPT_HOST_BASES = {"RefCounted": true, "Node": true, "Object": true}
const AB = preload("res://abi.gd")


static func script_props_literal(vars):
	if vars.is_empty():
		return null
	var names = []
	for v in vars:
		names.append(v["name"])
	return JSON.stringify(names)


static func script_props_reader_literal(cls, vars):
	var reads = []
	for v in vars:
		reads.append("s." + v["name"])
	return "(o) => { const s = o as " + cls + "; return [" + ", ".join(reads) + "]; }"


static func field_types_literal(vars):
	var rows = []
	for v in vars:
		var base = ""
		if v.get("type") != null and v["type"].get("kind") == "named":
			var name = v["type"]["name"]
			var open = name.find("[")
			base = name if open < 0 else name.substr(0, open)
		var acc = v.get("accessor")
		if acc != null:
			var known = base == "int" or base == "float" or base == "bool" or base == "String" or base == "Vector2"
			var tag = base
			if not known:
				tag = "accessor"
			rows.append(JSON.stringify(v["name"]) + ": " + JSON.stringify(tag))
			continue
		if v.get("type") == null or v["type"].get("kind") != "named":
			continue
		if base == "int" or base == "float" or base == "bool" or base == "String" or base == "Vector2":
			rows.append(JSON.stringify(v["name"]) + ": " + JSON.stringify(base))
	if rows.is_empty():
		return null
	return "{" + ", ".join(rows) + "}"


static func static_names_literal(funcs):
	var out = []
	for f in funcs:
		if f.get("isStatic"):
			out.append(f["name"])
	return out


static func fwd_params(params, arr):
	var out = []
	for i in params.size():
		var p = params[i]
		if p.get("default") == null:
			out.append(arr + "[" + str(i) + "] as rt.Variant")
		else:
			out.append(arr + ".length > " + str(i) + " ? (" + arr + "[" + str(i) + "] as rt.Variant) : undefined")
	return ", ".join(out)


static func static_var_table_literal(vars):
	var rows = []
	for v in vars:
		if not v.get("isStatic"):
			continue
		var base = ""
		if v.get("type") != null and v["type"].get("kind") == "named":
			var name = v["type"]["name"]
			var open = name.find("[")
			base = name if open < 0 else name.substr(0, open)
		var known = base == "int" or base == "float" or base == "bool" or base == "String" or base == "Vector2"
		rows.append(JSON.stringify(v["name"]) + ": " + JSON.stringify(base if known else ""))
	if rows.is_empty():
		return null
	return "{" + ", ".join(rows) + "}"


static func _dead(vars, statics):
	for v in vars:
		var a = v.get("accessor")
		if not v.get("isStatic") or a == null:
			continue
		var g = a.get("getter")
		var s = a.get("setter")
		if g != null and g.get("kind") == "method" and not statics.has(g["method"]):
			return true
		if s != null and s.get("kind") == "method" and not statics.has(s["method"]):
			return true
	return false


static func _dead_walk(vars, funcs, inner):
	var statics = {}
	for f in funcs:
		if f.get("isStatic"):
			statics[f["name"]] = true
	if _dead(vars, statics):
		return true
	for c in inner:
		if _dead_walk(c["vars"], c["funcs"], c["innerClasses"]):
			return true
	return false


static func has_dead_static_delegate(m):
	return _dead_walk(m["vars"], m["funcs"], m["innerClasses"])


static func inner_inherited_method_names(decl):
	var seen = {decl["name"]: true}
	var out = []
	var next = decl.get("extends")
	while next != null:
		if not CTX.ctx["INNER_CLASSES"].has(next):
			break
		var parent = CTX.ctx["INNER_CLASSES"][next]
		if seen.has(parent["name"]):
			break
		seen[parent["name"]] = true
		for f in parent["funcs"]:
			if not f.get("isStatic"):
				out.append(f["name"])
		next = parent.get("extends")
	return out


static func inner_inherited_names(decl):
	var seen = {decl["name"]: true}
	var out = []
	var next = decl.get("extends")
	while next != null:
		if not CTX.ctx["INNER_CLASSES"].has(next):
			break
		var parent = CTX.ctx["INNER_CLASSES"][next]
		if seen.has(parent["name"]):
			break
		seen[parent["name"]] = true
		for v in parent["vars"]:
			if not v.get("isStatic"):
				out.append(v["name"])
		for s in parent["signals"]:
			out.append(s["name"])
		next = parent.get("extends")
	return out


static func _put(c, out, done, visiting):
	if done.has(c["name"]):
		return true
	if visiting.has(c["name"]):
		return false
	visiting[c["name"]] = true
	var ext = c.get("extends")
	if ext != null and CTX.ctx["INNER_CLASSES"].has(ext):
		if not _put(CTX.ctx["INNER_CLASSES"][ext], out, done, visiting):
			return false
	visiting.erase(c["name"])
	done[c["name"]] = true
	out.append(c)
	return true


static func order_inner_classes(classes):
	var out = []
	var done = {}
	var visiting = {}
	for c in classes:
		if not _put(c, out, done, visiting):
			return {"__error": "class-extends", "message": "内部类 " + c["name"] + " 的 extends 成环"}
	return out


static func pattern_names(p):
	var kind = p.get("kind")
	if kind == "bind":
		return [p["name"]]
	if kind == "array":
		var out = []
		for it in p["items"]:
			for n in pattern_names(it):
				out.append(n)
		return out
	if kind == "dict":
		var out = []
		for en in p["entries"]:
			for n in pattern_names(en["pattern"]):
				out.append(n)
		return out
	return []

static func statics_table_literal(cls, funcs):
	var rows = []
	for f in funcs:
		if f.get("isStatic") != true:
			continue
		var fwd = fwd_params(f["params"], "a")
		rows.append(JSON.stringify(f["name"]) + ": (a: rt.Variant[]): rt.Variant => rt.wrapValue(" + cls + "." + f["name"] + "(" + fwd + "))")
	return "{" + ", ".join(rows) + "}"


static func _lt_exprTypes(e, cx):
	var kind = e.get("kind")
	if kind == "lambda":
		for s in e["body"]:
			_lt_stmt(s, cx)
		return
	if kind == "call":
		_lt_exprTypes(e["callee"], cx)
		for a in e["args"]:
			_lt_exprTypes(a, cx)
		return
	if kind == "binary":
		_lt_exprTypes(e["left"], cx)
		_lt_exprTypes(e["right"], cx)
		return
	if kind == "ternary":
		_lt_exprTypes(e["cond"], cx)
		_lt_exprTypes(e["thenE"], cx)
		_lt_exprTypes(e["elseE"], cx)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_lt_exprTypes(e["operand"], cx)
		return
	if kind == "attribute":
		_lt_exprTypes(e["obj"], cx)
		return
	if kind == "index":
		_lt_exprTypes(e["obj"], cx)
		_lt_exprTypes(e["index"], cx)
		return
	if kind == "array":
		for it in e["items"]:
			_lt_exprTypes(it, cx)
		return
	if kind == "dict":
		for en in e["entries"]:
			_lt_exprTypes(en["key"], cx)
			_lt_exprTypes(en["value"], cx)
		return


static func _lt_stmt(s, cx):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("type") != null:
			cx["out"][s["name"]] = s["type"]
		else:
			cx["untyped"].append(s["name"])
		return
	if kind == "if":
		for br in s["branches"]:
			if br.get("cond") != null:
				_lt_exprTypes(br["cond"], cx)
			for x in br["body"]:
				_lt_stmt(x, cx)
		return
	if kind == "for":
		_lt_exprTypes(s["iter"], cx)
		for x in s["body"]:
			_lt_stmt(x, cx)
		return
	if kind == "while":
		_lt_exprTypes(s["cond"], cx)
		for x in s["body"]:
			_lt_stmt(x, cx)
		return
	if kind == "match":
		_lt_exprTypes(s["subject"], cx)
		for arm in s["arms"]:
			if arm.get("guard") != null:
				_lt_exprTypes(arm["guard"], cx)
			for x in arm["body"]:
				_lt_stmt(x, cx)
		return
	if kind == "assign":
		_lt_exprTypes(s["target"], cx)
		_lt_exprTypes(s["value"], cx)
		return
	if kind == "expr":
		_lt_exprTypes(s["expr"], cx)
		return
	if kind == "return":
		if s.get("value") != null:
			_lt_exprTypes(s["value"], cx)


static func collect_local_types(body, out, untyped):
	var cx = {"out": out, "untyped": untyped}
	for s in body:
		_lt_stmt(s, cx)
	return out


static func collect_script_base(c, out):
	var base = "RefCounted" if (c.get("extends") == null or c.get("extends") == "") else c["extends"]
	if base == "RefCounted" or out.get(base) != null or SCRIPT_HOST_BASES.has(base):
		var known = out.get(base)
		out[c["name"]] = base if known == null else known
	for inner in c["innerClasses"]:
		collect_script_base(inner, out)


static func _required_count(params):
	for i in params.size():
		if params[i].get("default") != null:
			return i
	return params.size()


static func method_arities_literal(funcs):
	var rows = []
	for f in funcs:
		if f["name"] == "_init":
			continue
		rows.append(JSON.stringify(f["name"]) + ": [" + str(_required_count(f["params"])) + ", " + str(f["params"].size()) + "]")
	if rows.is_empty():
		return null
	return "{ " + ", ".join(rows) + " }"


static func ctor_arities_literal(funcs):
	var ctor = null
	for f in funcs:
		if f["name"] == "_init":
			ctor = f
			break
	if ctor == null or ctor["params"].is_empty():
		return null
	return "[" + str(_required_count(ctor["params"])) + ", " + str(ctor["params"].size()) + "]"


static func method_params_literal(funcs):
	var rows = []
	for f in funcs:
		if f["name"] == "_init" or f["params"].is_empty():
			continue
		var slots = []
		var any = false
		for pt in f["params"]:
			if pt.get("type") == null or pt["type"].get("kind") != "named":
				slots.append("null")
			else:
				slots.append(JSON.stringify(pt["type"]["name"]))
				any = true
		if not any:
			continue
		rows.append(JSON.stringify(f["name"]) + ": [" + ", ".join(slots) + "]")
	if rows.is_empty():
		return null
	return "{ " + ", ".join(rows) + " }"

static func inner_class_base(text):
	if text == "RefCounted" or text == "Object":
		return null
	if CTX.ctx["INNER_CLASSES"].has(text):
		return text
	return {"__error": "class-extends", "message": "内部类 extends " + text + " 还没实测过（引擎类型属 Tier 2，跨文件的内部类基类那一格没量）"}


static func pct_static_side(e):
	var kind = e.get("kind")
	if kind == "ident":
		if CTX.ctx["UNTYPED_NAMES"].has(e["name"]):
			return false
		var table = null
		if CTX.ctx["LOCAL_TYPES"].has(e["name"]):
			table = CTX.ctx["LOCAL_TYPES"]
		elif CTX.ctx["VAR_TYPES"].has(e["name"]):
			table = CTX.ctx["VAR_TYPES"]
		if table == null:
			return true
		var t = table.get(e["name"])
		if t == null:
			return false
		return not (t.get("kind") == "named" and t.get("name") == "Variant")
	if kind == "call":
		if e["callee"].get("kind") != "ident":
			return true
		if not CTX.ctx["FUNC_RETURNS"].has(e["callee"]["name"]):
			return true
		var ret = CTX.ctx["FUNC_RETURNS"][e["callee"]["name"]]
		if ret == null:
			return false
		return not (ret.get("kind") == "named" and ret.get("name") == "Variant")
	if kind == "index":
		if e["obj"].get("kind") != "ident":
			return true
		var table2 = null
		if CTX.ctx["LOCAL_TYPES"].has(e["obj"]["name"]):
			table2 = CTX.ctx["LOCAL_TYPES"]
		elif CTX.ctx["VAR_TYPES"].has(e["obj"]["name"]):
			table2 = CTX.ctx["VAR_TYPES"]
		var t2 = null if table2 == null else table2.get(e["obj"]["name"])
		if t2 != null and t2.get("kind") == "named" and (t2.get("name") == "Array" or t2.get("name") == "Dictionary"):
			return false
		return true
	return true

static func dict_identity_literal(desc_var, cls_path, vars, cls_name):
	var res = "null"
	if CTX.ctx["MODULE_RES_PATH"] != null:
		res = JSON.stringify(CTX.ctx["MODULE_RES_PATH"])
	var kept = []
	for v in vars:
		if v.get("isStatic") != true and v.get("isConst") != true:
			kept.append(v)
	var kept_names = []
	for v in kept:
		kept_names.append(v["name"])
	var names = JSON.stringify(kept_names)
	var acc_rows = []
	for v in vars:
		var acc = v.get("accessor")
		if acc == null:
			continue
		var base = null
		if v.get("type") != null and v["type"].get("kind") == "named":
			base = v["type"]["name"]
			var open = base.find("[")
			if open >= 0:
				base = base.substr(0, open)
		acc_rows.append(JSON.stringify(v["name"]) + ": " + JSON.stringify(base))
	var acc = "{}"
	if not acc_rows.is_empty():
		acc = "{" + ", ".join(acc_rows) + "}"
	var reads = []
	for v in kept:
		var acc2 = v.get("accessor")
		if acc2 == null:
			reads.append("s." + v["name"])
		else:
			var slot = AB.prop_slot(v)
			reads.append("rt.V.nil()" if slot == null else "s." + slot)
	return "rt.registerDictIdentity(" + desc_var + ", " + res + ", " + JSON.stringify(cls_path) + ", " + names + ", " + acc + ", (o) => { const s = o as " + cls_name + "; return [" + ", ".join(reads) + "]; });"
