const CTX = preload("res://context.gd")
const HE = preload("res://helpers.gd")
const O = preload("res://op_tables.gd")
const INT_ARITH = {"+": true, "-": true, "*": true, "/": true, "%": true}
const FLOAT_ARITH = {"+": true, "-": true, "*": true, "/": true}
const CMP_OPS = {"<": true, "<=": true, ">": true, ">=": true, "==": true, "!=": true}
const SAFE_INT = 9007199254740991
const ABI_KINDS = ["int", "float", "str"]
const HP = preload("res://helpers.gd")

const MEASURED_SLOTS = {"int": true, "float": true, "bool": true, "String": true, "StringName": true, "Vector2": true, "Vector2i": true, "Vector3": true, "Vector3i": true, "Vector4": true, "Vector4i": true, "Color": true}
const RAW_INT_MIN = -9007199254740991
const RAW_INT_MAX = 9007199254740991


static func leaf_of(k):
	if k == "int[]":
		return "int"
	if k == "float[]":
		return "float"
	if k == "str[]":
		return "str"
	return k


static func raw_elem_ts(k):
	if leaf_of(k) == "str":
		return "string"
	return "number"


static func static_var_slots_literal(cls, vars):
	var rows = []
	for v in vars:
		if not v.get("isStatic"):
			continue
		var name = "\"" + v["name"] + "\""
		rows.append(name + ": { get: (): rt.Variant => " + cls + "." + v["name"] + ", set: (__v: rt.Variant): void => { " + cls + "." + v["name"] + " = __v; } }")
	if rows.is_empty():
		return null
	return "{" + ", ".join(rows) + "}"


static func prop_slot(v):
	var a = v.get("accessor")
	if a == null:
		return null
	if v.get("init") != null or a.get("getter") == null:
		return "__gd_store_" + v["name"]
	return null


static func add_bind(out, name):
	out[name] = out.get(name, 0) + 1


static func drop_bind(out, name):
	var left = out.get(name, 1) - 1
	if left <= 0:
		out.erase(name)
	else:
		out[name] = left


static func collect_binds(root, out):
	if root is Array:
		for v in root:
			collect_binds(v, out)
		return out
	if not (root is Dictionary):
		return out
	if (root.get("kind") == "var" or root.get("kind") == "bind") and root.get("name") != null:
		add_bind(out, root["name"])
	var loop_var = null
	if root.get("kind") == "for" and root.get("var") != null:
		loop_var = root["var"]
	if loop_var != null:
		add_bind(out, loop_var)
	if root.get("params") is Array:
		for p in root["params"]:
			if p.get("name") != null:
				add_bind(out, p["name"])
	for k in root.keys():
		collect_binds(root[k], out)
	if loop_var != null:
		drop_bind(out, loop_var)
	return out


static func seed_param_binds(params):
	var out = {}
	for p in params:
		add_bind(out, p["name"])
	return out


static func slot_type_name(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	var open = name.find("[")
	var base = name if open < 0 else name.substr(0, open)
	return base if MEASURED_SLOTS.has(base) else null


static func scalar_lit_kind(e):
	if e.get("kind") != "lit":
		return null
	if e.get("lit") == "float" and e.get("value") != null:
		return "float"
	if e.get("lit") == "int" and e.get("value") != null:
		return "int"
	if e.get("lit") == "string":
		return "str"
	return null


static func elem_kind_from_init(init, nested = false):
	var items = init["items"]
	if items.is_empty():
		return "int"
	var scalar = null
	var scalar_ok = true
	for it in items:
		var k = scalar_lit_kind(it)
		if k == null:
			scalar_ok = false
			break
		if scalar != null and scalar != k:
			scalar_ok = false
			break
		scalar = k
	if scalar_ok and scalar != null:
		return scalar
	if nested:
		var leaf = null
		for row in items:
			if row.get("kind") != "array":
				return null
			for it in row["items"]:
				var k = scalar_lit_kind(it)
				if k == null:
					return null
				if leaf != null and leaf != k:
					return null
				leaf = k
		if leaf != null:
			if leaf == "float":
				return "float[]"
			if leaf == "str":
				return "str[]"
			return "int[]"
	return null


static func key_kind_ok(k):
	return k == "int" or k == "str"


static func slot_elem_kind_name(name):
	if HP.is_elem_kind(name):
		return name
	return "Object" if CTX.ctx["SCRIPT_BASE"].has(name) else null


static func container_slot(code, value, text, say):
	if text == null or value.get("kind") == "array" or value.get("kind") == "dict":
		return code
	return "rt." + say + "(" + code + ", \"" + text + "\")"


static func declared_cast(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	var open = name.find("[")
	var base = name if open < 0 else name.substr(0, open)
	if base == "int":
		return "rt.toInt"
	if base == "float":
		return "rt.toFloat"
	if base == "bool":
		return "rt.toBool"
	if base == "String":
		return "rt.strOf"
	if base == "Vector2":
		return "rt.toVec2"
	if base == "Vector3":
		return "rt.toVec3"
	if base == "Vector3i":
		return "rt.toVec3i"
	if base == "Vector4":
		return "rt.toVec4"
	if base == "Vector4i":
		return "rt.toVec4i"
	if base == "Vector2i":
		return "rt.toVec2i"
	if base == "Color":
		return "rt.toColor"
	if base == "StringName":
		return "rt.toStringNameSlot"
	return null


static func raw_int_lit(e):
	if e.get("kind") != "lit" or e.get("lit") != "int":
		return null
	if e.get("value") == null:
		return null
	return int(e["value"])


static func lit_binary_fits_raw(e):
	var a = raw_int_lit(e["left"])
	var b = raw_int_lit(e["right"])
	if a == null or b == null:
		return true
	var op = e["op"]
	if op == "*":
		if a == 0 or b == 0:
			return true
		if abs(a) > 3037000500 or abs(b) > 3037000500:
			return false
		var r = a * b
		return r >= RAW_INT_MIN and r <= RAW_INT_MAX
	if op != "+" and op != "-":
		return true
	var s = a + b if op == "+" else a - b
	if op == "+":
		if (b > 0 and s < a) or (b < 0 and s > a):
			return false
	elif b < 0 and s < a:
		return false
	elif b > 0 and s > a:
		return false
	return s >= RAW_INT_MIN and s <= RAW_INT_MAX


static func abi_form_ok(f):
	if f.get("coroutine") or f.get("isStatic"):
		return false
	if f.get("returnType") != null:
		return false
	if f["body"].is_empty():
		return false
	for p in f["params"]:
		if p.get("type") != null or p.get("default") != null:
			return false
	var saw_return = false
	for st in f["body"]:
		if st.get("kind") == "return":
			if st.get("value") == null:
				return false
			saw_return = true
		elif st.get("kind") == "var":
			if st.get("type") != null:
				return false
		elif st.get("kind") == "assign":
			if st["target"].get("kind") != "ident":
				return false
		else:
			return false
	return saw_return


static func same_abis(a, b):
	if a.size() != b.size():
		return false
	for k in a.keys():
		if not b.has(k):
			return false
		if b[k]["ret"] != a[k]["ret"]:
			return false
	return true

static func is_grid_elem(k):
	return k == "int[]" or k == "float[]" or k == "str[]"


static func kind_of_expr(e, ids, arrays = null, dict = null):
	if arrays == null:
		arrays = {}
	if dict == null:
		dict = {}
	var kind = e.get("kind")
	if kind == "lit":
		if e.get("lit") == "int" and typeof(e.get("value")) == TYPE_INT and absi(e["value"]) <= SAFE_INT:
			return "int"
		if e.get("lit") == "float" and (typeof(e.get("value")) == TYPE_FLOAT or typeof(e.get("value")) == TYPE_INT):
			return "float"
		if e.get("lit") == "string":
			return "str"
		return null
	if kind == "ident":
		return ids.get(e["name"])
	if kind == "binary":
		var lk = kind_of_expr(e["left"], ids, arrays, dict)
		var rk = kind_of_expr(e["right"], ids, arrays, dict)
		if lk == null or rk == null or lk == "bool" or rk == "bool" or lk != rk:
			return null
		var op = e.get("op")
		if lk == "int" and INT_ARITH.has(op):
			return "int" if lit_binary_fits_raw(e) else null
		if lk == "float" and FLOAT_ARITH.has(op):
			return "float"
		if lk == "str" and op == "+":
			return "str"
		if (lk == "int" or lk == "float") and CMP_OPS.has(op):
			return "bool"
		return null
	if kind == "unary":
		if e.get("op") != "-":
			return null
		var ok = kind_of_expr(e["operand"], ids, arrays, dict)
		if ok == "int" or ok == "float":
			return ok
		return null
	if kind == "index":
		var mid = e["obj"]
		if mid.get("kind") == "index" and mid["obj"].get("kind") == "ident":
			var ek0 = arrays.get(mid["obj"]["name"])
			if ek0 != null and is_grid_elem(ek0) and kind_of_expr(mid["index"], ids, arrays, dict) == "int" and kind_of_expr(e["index"], ids, arrays, dict) == "int":
				return leaf_of(ek0)
		if e["obj"].get("kind") == "ident":
			var ek = arrays.get(e["obj"]["name"])
			if ek != null and not is_grid_elem(ek) and kind_of_expr(e["index"], ids, arrays, dict) == "int":
				return ek
			var dk = dict.get(e["obj"]["name"])
			if dk != null:
				var kk = kind_of_expr(e["index"], ids, arrays, dict)
				if kk == "int" or kk == "str":
					return dk
		return null
	if kind == "call":
		var callee = e["callee"]
		if callee.get("kind") == "attribute" and callee["obj"].get("kind") == "ident":
			var recv = callee["obj"]["name"]
			var cname = callee.get("name")
			var argc = e["args"].size()
			if (arrays.has(recv) or dict.has(recv)) and (cname == "size" or cname == "length") and argc == 0:
				return "int"
			if arrays.has(recv) and cname == "insert" and argc == 2:
				return "int" if kind_of_expr(e["args"][0], ids, arrays, dict) == "int" else null
			var gk = dict.get(recv)
			if gk != null and cname == "get" and argc == 2:
				var kk2 = kind_of_expr(e["args"][0], ids, arrays, dict)
				var dk2 = kind_of_expr(e["args"][1], ids, arrays, dict)
				if (kk2 == "int" or kk2 == "str") and dk2 == gk:
					return gk
			return null
		if callee.get("kind") != "ident":
			return null
		var abi = CTX.ctx["RAW_ABIS"].get(callee["name"])
		if abi == null or e["args"].size() != abi["params"].size():
			return null
		for i in e["args"].size():
			if kind_of_expr(e["args"][i], ids, arrays, dict) != abi["params"][i]:
				return null
		return abi["ret"]
	return null


static func array_elem_kind(c):
	if c["init"]["items"].is_empty():
		return null
	return elem_kind_from_init(c["init"], true)

static func emit_raw_index_write(target, value):
	if target.get("kind") != "index":
		return null
	var EB = load("res://expr_boxed.gd")
	if target["obj"].get("kind") == "ident":
		var k = CTX.ctx["RAW_ARRAYS"].get(target["obj"]["name"])
		if k == null or is_grid_elem(k):
			return null
		var ri = EB.emit_expr_r(target["index"])
		var vr = EB.emit_expr_r(value)
		if ri["rep"] != "int" or vr["rep"] != k:
			return null
		return "rt.fast.rawArrSet" + HE.fast_suffix(k) + "(" + target["obj"]["name"] + ", " + ri["code"] + ", " + vr["code"] + ");"
	if target["obj"].get("kind") == "index" and target["obj"]["obj"].get("kind") == "ident":
		var k2 = CTX.ctx["RAW_ARRAYS"].get(target["obj"]["obj"]["name"])
		if k2 == null or not is_grid_elem(k2):
			return null
		var i2 = EB.emit_expr_r(target["obj"]["index"])
		var j2 = EB.emit_expr_r(target["index"])
		var v2 = EB.emit_expr_r(value)
		if i2["rep"] != "int" or j2["rep"] != "int" or v2["rep"] != leaf_of(k2):
			return null
		return "rt.fast.rawArrSet" + HE.fast_suffix(k2) + "2(" + target["obj"]["obj"]["name"] + ", " + i2["code"] + ", " + j2["code"] + ", " + v2["code"] + ");"
	return null

static func _cu_global_read(e):
	var AZ = load("res://analyze_idx.gd")
	if CTX.get_analysis() == null:
		return false
	return AZ.is_global_value_read(CTX.get_analysis(), e)


static func _cu_expr(cx, e, in_lambda):
	var kind = e.get("kind")
	if kind == "ident":
		if _cu_global_read(e):
			cx["excluded"][e["name"]] = true
		return
	if kind == "lambda":
		for s in e["body"]:
			_cu_stmt(cx, s, true)
		return
	if kind == "binary":
		_cu_expr(cx, e["left"], in_lambda)
		_cu_expr(cx, e["right"], in_lambda)
		return
	if kind == "ternary":
		_cu_expr(cx, e["cond"], in_lambda)
		_cu_expr(cx, e["thenE"], in_lambda)
		_cu_expr(cx, e["elseE"], in_lambda)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_cu_expr(cx, e["operand"], in_lambda)
		return
	if kind == "call":
		_cu_expr(cx, e["callee"], in_lambda)
		for a in e["args"]:
			_cu_expr(cx, a, in_lambda)
		return
	if kind == "attribute":
		_cu_expr(cx, e["obj"], in_lambda)
		return
	if kind == "index":
		_cu_expr(cx, e["obj"], in_lambda)
		_cu_expr(cx, e["index"], in_lambda)
		return
	if kind == "array":
		for it in e["items"]:
			_cu_expr(cx, it, in_lambda)
		return
	if kind == "dict":
		for en in e["entries"]:
			_cu_expr(cx, en["key"], in_lambda)
			_cu_expr(cx, en["value"], in_lambda)
		return


static func _cu_stmt(cx, s, in_lambda):
	var kind = s.get("kind")
	if kind == "var":
		if in_lambda:
			cx["excluded"][s["name"]] = true
		elif s.get("type") == null:
			cx["decls"].append({"name": s["name"], "init": s.get("init")})
		else:
			cx["excluded"][s["name"]] = true
		if s.get("init") != null:
			_cu_expr(cx, s["init"], in_lambda)
		return
	if kind == "assign":
		if s["target"].get("kind") == "ident":
			if in_lambda:
				cx["excluded"][s["target"]["name"]] = true
			else:
				cx["assigns"].append({"name": s["target"]["name"], "value": s["value"]})
		_cu_expr(cx, s["target"], in_lambda)
		_cu_expr(cx, s["value"], in_lambda)
		return
	if kind == "expr":
		_cu_expr(cx, s["expr"], in_lambda)
		return
	if kind == "return":
		if s.get("value") != null:
			_cu_expr(cx, s["value"], in_lambda)
		return
	if kind == "if":
		for b in s["branches"]:
			if b.get("cond") != null:
				_cu_expr(cx, b["cond"], in_lambda)
			for x in b["body"]:
				_cu_stmt(cx, x, in_lambda)
		return
	if kind == "for":
		if in_lambda or not load("res://helpers.gd").is_range_call(s["iter"]):
			cx["excluded"][s["var"]] = true
		else:
			cx["decls"].append({"name": s["var"], "init": {"kind": "lit", "lit": "int", "value": 0, "loc": s["iter"].get("loc")}})
		_cu_expr(cx, s["iter"], in_lambda)
		for x in s["body"]:
			_cu_stmt(cx, x, in_lambda)
		return
	if kind == "while":
		_cu_expr(cx, s["cond"], in_lambda)
		for x in s["body"]:
			_cu_stmt(cx, x, in_lambda)
		return
	if kind == "match":
		_cu_expr(cx, s["subject"], in_lambda)
		for a in s["arms"]:
			if a.get("guard") != null:
				_cu_expr(cx, a["guard"], in_lambda)
			for n in load("res://layout.gd").pattern_names(a["pattern"]):
				cx["excluded"][n] = true
			for x in a["body"]:
				_cu_stmt(cx, x, in_lambda)
		return


static func _cu_is_lit(e, kind):
	if e.get("kind") != "lit":
		return false
	if kind == "int":
		return e.get("lit") == "int" and typeof(e.get("value")) == TYPE_INT and absi(e["value"]) <= 9007199254740991
	if kind == "float":
		return e.get("lit") == "float"
	return e.get("lit") == "string"


static func _cu_kind_at(param_kind, result, self_name, U, kind, n):
	var a = param_kind.get(n)
	if a != null:
		return a
	var b = result.get(n)
	if b != null:
		return b
	if n == self_name or U.has(n):
		return kind
	return null


static func compute_unboxed(f, arrays = null, dict = null):
	if arrays == null:
		arrays = {}
	if dict == null:
		dict = {}
	var abi = CTX.ctx["RAW_ABIS"].get(f["name"])
	var param_kind = {}
	if abi != null:
		for i in f["params"].size():
			param_kind[f["params"][i]["name"]] = abi["params"][i]
	var excluded = {}
	for p in f["params"]:
		excluded[p["name"]] = true
	var cx = {"excluded": excluded, "decls": [], "assigns": []}
	for s in f["body"]:
		_cu_stmt(cx, s, false)
	var result = {}
	if abi != null:
		for i in f["params"].size():
			result[f["params"][i]["name"]] = abi["params"][i]
	for kind in ABI_KINDS:
		var U = {}
		for d in cx["decls"]:
			if not excluded.has(d["name"]) and not result.has(d["name"]):
				U[d["name"]] = true
		var pruned = true
		while pruned:
			pruned = false
			var names = U.keys().duplicate()
			for name in names:
				var ok_init = true
				for d2 in cx["decls"]:
					if d2["name"] != name:
						continue
					if d2["init"] == null or not _cu_num_with(d2["init"], kind, name, U, param_kind, result, arrays, dict):
						ok_init = false
						break
				var ok = ok_init
				if ok:
					for a in cx["assigns"]:
						if a["name"] != name:
							continue
						if not _cu_num_with(a["value"], kind, name, U, param_kind, result, arrays, dict):
							ok = false
							break
				if ok:
					continue
				U.erase(name)
				pruned = true
		for name2 in U:
			result[name2] = kind
	return result


static func _cu_num_with(e, kind, self_name, U, param_kind, result, arrays, dict):
	var k = e.get("kind")
	if k == "call" or k == "binary" or k == "index":
		var ids = {}
		for n in _cu_ident_domain(param_kind, result, U):
			ids[n] = _cu_kind_at(param_kind, result, self_name, U, kind, n)
		return kind_of_expr(e, ids, arrays, dict) == kind
	if k == "lit":
		return _cu_is_lit(e, kind)
	if k == "ident":
		return e["name"] == self_name or U.has(e["name"]) or param_kind.get(e["name"]) == kind
	return false


static func _cu_ident_domain(param_kind, result, U):
	var out = []
	for n in param_kind:
		out.append(n)
	for n2 in result:
		out.append(n2)
	for n3 in U:
		out.append(n3)
	return out

static func _num_literal_expr(x):
	if x.get("kind") == "lit" and (x.get("lit") == "int" or x.get("lit") == "float"):
		return true
	if x.get("kind") == "unary" and x.get("op") == "-":
		var inner = x.get("operand")
		return inner != null and inner.get("kind") == "lit" and (inner.get("lit") == "int" or inner.get("lit") == "float")
	return false


static func try_raw_binary(e):
	var EB = load("res://expr_boxed.gd")
	var l = EB.emit_expr_r(e["left"])
	var r = EB.emit_expr_r(e["right"])
	var op = e.get("op")
	if O.CMP_RAW.has(op) and l["rep"] == r["rep"] and (l["rep"] == "int" or l["rep"] == "float"):
		var lc = "(" + l["code"] + " as number)" if _num_literal_expr(e["left"]) else l["code"]
		var rc = "(" + r["code"] + " as number)" if _num_literal_expr(e["right"]) else r["code"]
		return {"code": "(" + lc + " " + O.CMP_RAW[op] + " " + rc + ")", "rep": "bool"}
	if l["rep"] == "int" and r["rep"] == "int" and O.ARITH_RAW.has(op):
		if not lit_binary_fits_raw(e):
			return null
		return {"code": "rt.fast." + O.ARITH_RAW[op] + "(" + l["code"] + ", " + r["code"] + ")", "rep": "int"}
	if l["rep"] == "float" and r["rep"] == "float" and O.FLOAT_ARITH_RAW.has(op):
		return {"code": "(" + l["code"] + " " + O.FLOAT_ARITH_RAW[op] + " " + r["code"] + ")", "rep": "float"}
	if l["rep"] == "str" and r["rep"] == "str" and op == "+":
		return {"code": "(" + l["code"] + " + " + r["code"] + ")", "rep": "str"}
	return null


static func prop_slot_init(v):
	var head = "  static " if v.get("isStatic") == true else "  "
	var slot = prop_slot(v)
	var slot_text = "null" if slot == null else slot
	return head + slot_text + " = " + slot_init(v.get("type"), v.get("init"), v.get("isStatic") == true) + ";"


static func slot_init(t, init, self_is_nil = false):
	var prev = CTX.ctx["selfInNilContext"]
	CTX.ctx["selfInNilContext"] = self_is_nil
	var raw = "null"
	var has_init = init != null
	if has_init:
		raw = load("res://expr_boxed.gd").emit_expr(init)
	var from_literal = not has_init or init.get("kind") == "array" or init.get("kind") == "dict"
	var out = HE.stamp_decl(t, raw, has_init, from_literal)
	var cast = declared_cast(t)
	CTX.ctx["selfInNilContext"] = prev
	if cast == null:
		return out
	return cast + "(" + out + ")"

static func _sru_escape(cx, n):
	if n != "super":
		cx["escapes"][n] = true


static func _sru_expr(cx, e, owner, allow_site):
	var kind = e.get("kind")
	if kind == "lit":
		if e.get("lit") == "string":
			_sru_escape(cx, String(e["value"]))
		return
	if kind == "ident":
		_sru_escape(cx, e["name"])
		return
	if kind == "call":
		if e["callee"].get("kind") == "ident":
			var nm = e["callee"]["name"]
			if allow_site and owner != null and cx["cands"].has(nm):
				var bucket = cx["sites"].get(nm)
				if bucket == null:
					bucket = []
					cx["sites"][nm] = bucket
				bucket.append({"args": e["args"], "owner": owner})
			else:
				_sru_escape(cx, nm)
		else:
			_sru_expr(cx, e["callee"], owner, false)
		for a in e["args"]:
			_sru_expr(cx, a, owner, allow_site)
		return
	if kind == "attribute":
		_sru_escape(cx, e["name"])
		_sru_expr(cx, e["obj"], owner, allow_site)
		return
	if kind == "index":
		_sru_expr(cx, e["obj"], owner, allow_site)
		_sru_expr(cx, e["index"], owner, allow_site)
		return
	if kind == "binary":
		_sru_expr(cx, e["left"], owner, allow_site)
		_sru_expr(cx, e["right"], owner, allow_site)
		return
	if kind == "ternary":
		_sru_expr(cx, e["cond"], owner, allow_site)
		_sru_expr(cx, e["thenE"], owner, allow_site)
		_sru_expr(cx, e["elseE"], owner, allow_site)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_sru_expr(cx, e["operand"], owner, allow_site)
		return
	if kind == "array":
		for it in e["items"]:
			_sru_expr(cx, it, owner, allow_site)
		return
	if kind == "dict":
		for en in e["entries"]:
			_sru_expr(cx, en["key"], owner, allow_site)
			_sru_expr(cx, en["value"], owner, allow_site)
		return
	if kind == "lambda":
		for s in e["body"]:
			_sru_stmt(cx, s, owner, false)
		return


static func _sru_stmt(cx, s, owner, allow_site):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("init") != null:
			_sru_expr(cx, s["init"], owner, allow_site)
		return
	if kind == "assign":
		_sru_expr(cx, s["target"], owner, allow_site)
		_sru_expr(cx, s["value"], owner, allow_site)
		return
	if kind == "expr":
		_sru_expr(cx, s["expr"], owner, allow_site)
		return
	if kind == "return":
		if s.get("value") != null:
			_sru_expr(cx, s["value"], owner, allow_site)
		return
	if kind == "if":
		for b in s["branches"]:
			if b.get("cond") != null:
				_sru_expr(cx, b["cond"], owner, allow_site)
			for x in b["body"]:
				_sru_stmt(cx, x, owner, allow_site)
		return
	if kind == "for":
		_sru_expr(cx, s["iter"], owner, allow_site)
		for x in s["body"]:
			_sru_stmt(cx, x, owner, allow_site)
		return
	if kind == "while":
		_sru_expr(cx, s["cond"], owner, allow_site)
		for x in s["body"]:
			_sru_stmt(cx, x, owner, allow_site)
		return
	if kind == "match":
		_sru_expr(cx, s["subject"], owner, allow_site)
		for a in s["arms"]:
			if a.get("guard") != null:
				_sru_expr(cx, a["guard"], owner, allow_site)
			for x in a["body"]:
				_sru_stmt(cx, x, owner, false)
		return
	if kind == "break" or kind == "continue" or kind == "pass":
		return


static func _sru_class(cx, c):
	for v in c["vars"]:
		if v.get("init") != null:
			_sru_expr(cx, v["init"], null, false)
	for f in c["funcs"]:
		for s in f["body"]:
			_sru_stmt(cx, s, f, false)
	for inner in c["innerClasses"]:
		_sru_class(cx, inner)


static func scan_raw_usage(m, cand_names):
	var cx = {"escapes": {}, "sites": {}, "cands": cand_names}
	for f in m["funcs"]:
		for p in f["params"]:
			if p.get("default") != null:
				_sru_expr(cx, p["default"], f, false)
		for s in f["body"]:
			_sru_stmt(cx, s, f, true)
	for v in m["vars"]:
		if v.get("init") != null:
			_sru_expr(cx, v["init"], null, false)
	for c in m["innerClasses"]:
		_sru_class(cx, c)
	return {"escapes": cx["escapes"], "sitesByF": cx["sites"]}


static func _repeat_kind(n, k):
	var out = []
	for i in n:
		out.append(k)
	return out


static func compute_raw_abis(m, scope):
	var empty = {}
	if m["innerClasses"].size() > 0 or scope["hasBase"]:
		return empty
	var by_name = {}
	for f in m["funcs"]:
		by_name[f["name"]] = f
	var cand = {}
	for f2 in m["funcs"]:
		if not abi_form_ok(f2):
			continue
		if f2["name"].begins_with("_"):
			continue
		if CTX.ctx["ENUM_NAMES"].has(f2["name"]) or CTX.ctx["MODULE_VARS"].has(f2["name"]) or CTX.ctx["MODULE_CLASSES"].has(f2["name"]):
			continue
		if scope["inherited"].has(f2["name"]) or scope["external"].has(f2["name"]):
			continue
		cand[f2["name"]] = true
	if cand.is_empty():
		return empty
	var scan = scan_raw_usage(m, cand)
	for n in scan["escapes"]:
		cand.erase(n)
	for n2 in cand.keys().duplicate():
		var s = scan["sitesByF"].get(n2)
		if s == null or s.is_empty():
			cand.erase(n2)
	if cand.is_empty():
		return empty
	var saved = CTX.ctx["RAW_ABIS"]
	var seed = {}
	for name in cand:
		var f3 = by_name[name]
		for k in ABI_KINDS:
			if HE.sig_valid(f3, k, [], {}):
				seed[name] = {"params": _repeat_kind(f3["params"].size(), k), "ret": k}
				break
	var cur = seed
	var stable = false
	var cap = (cand.size() + 2) * 4
	for it in cap:
		CTX.ctx["RAW_ABIS"] = cur
		var u_cache = {}
		for f4 in m["funcs"]:
			u_cache[f4["name"]] = compute_unboxed(f4)
		var nxt = {}
		for name2 in cand:
			var f5 = by_name[name2]
			var sites = scan["sitesByF"].get(name2)
			if sites == null:
				sites = []
			for k2 in ABI_KINDS:
				if HE.sig_valid(f5, k2, sites, u_cache):
					nxt[name2] = {"params": _repeat_kind(f5["params"].size(), k2), "ret": k2}
					break
		if same_abis(cur, nxt):
			cur = nxt
			stable = true
			break
		cur = nxt
	CTX.ctx["RAW_ABIS"] = saved
	return cur if stable else empty
