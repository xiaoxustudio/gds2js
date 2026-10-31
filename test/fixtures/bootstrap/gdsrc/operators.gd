const SL = preload("res://slots.gd")
const FC = preload("res://faces.gd")
const AR = preload("res://arity.gd")
const WK = preload("res://walk.gd")
const LT = preload("res://literals.gd")
const ST = preload("res://analyze_state.gd")
const O = preload("res://op_tables.gd")
const T = preload("res://arity_tables.gd")

const ANNOT = {
	"bool": true,
	"int": true,
	"float": true,
	"String": true,
	"StringName": true,
	"NodePath": true,
	"PackedByteArray": true,
	"PackedStringArray": true,
	"Array": true,
	"Dictionary": true,
	"Vector2": true,
	"Vector2i": true,
	"Vector3": true,
	"Vector3i": true,
	"Color": true,
}


static func _named(t):
	if t == null or t.get("kind") != "named":
		return null
	var base = _base_of(t["name"])
	if ANNOT.has(base):
		return base
	return null


static func _base_of(name):
	var open = name.find("[")
	if open < 0:
		return name
	return name.substr(0, open)


static func _raw_of(t):
	if t == null or t.get("kind") != "named":
		return null
	return t["name"]


static func _has_void(t):
	if t == null or t.get("kind") != "named":
		return false
	var parts = String(t["name"]).replace("[", " ").replace("]", " ").replace(",", " ").split(" ", false)
	for part in parts:
		if part.strip_edges() == "void":
			return true
	return false


static func _va_classes(found, list):
	for c in list:
		for f in c["funcs"]:
			for p in f["params"]:
				if _has_void(p.get("type")):
					found.append(f["loc"])
		for v in c["vars"]:
			if _has_void(v.get("type")):
				found.append(v["loc"])
		_va_classes(found, c["innerClasses"])


static func check_void_annotation(m, diags):
	var found = []
	for f in m["funcs"]:
		for p in f["params"]:
			if _has_void(p.get("type")):
				found.append(f["loc"])
	for v in m["vars"]:
		if _has_void(v.get("type")):
			found.append(v["loc"])
	_va_classes(found, m["innerClasses"])
	if found.size() == 0:
		return
	var best = found[0]
	var best_line = 1e9
	for loc in found:
		var line = 1e9
		if loc != null:
			line = loc["line"]
		if line < best_line:
			best_line = line
			best = loc
	diags.append({"code": "void-annotation", "message": "\"void\" is only allowed for a function return type.", "loc": best})


static func _bool_decl(t):
	return t != null and t.get("kind") == "named" and t["name"] == "bool"


static func _lit_bool(e):
	return e.get("kind") == "lit" and typeof(e.get("value")) == TYPE_BOOL


static func _bool_side(e, bools):
	if _lit_bool(e):
		return true
	return e.get("kind") == "ident" and bools.has(e["name"])


static func _foldable_bool(e, consts):
	if _lit_bool(e):
		return true
	return e.get("kind") == "ident" and consts.has(e["name"])


static func _bool_scan(diags, ss, bools, consts):
	for s in ss:
		var kind = s.get("kind")
		if kind == "var":
			if _bool_decl(s.get("type")):
				bools[s["name"]] = true
			if s.get("init") != null:
				_bool_expr(diags, s["init"], bools, consts)
		elif kind == "assign":
			_bool_expr(diags, s["target"], bools, consts)
			_bool_expr(diags, s["value"], bools, consts)
		elif kind == "expr":
			_bool_expr(diags, s["expr"], bools, consts)
		elif kind == "return":
			if s.get("value") != null:
				_bool_expr(diags, s["value"], bools, consts)
		elif kind == "if":
			for b in s["branches"]:
				if b.get("cond") != null:
					_bool_expr(diags, b["cond"], bools, consts)
				_bool_scan(diags, b["body"], bools, consts)
		elif kind == "while":
			_bool_expr(diags, s["cond"], bools, consts)
			_bool_scan(diags, s["body"], bools, consts)
		elif kind == "for":
			_bool_expr(diags, s["iter"], bools, consts)
			_bool_scan(diags, s["body"], bools, consts)
		elif kind == "match":
			_bool_expr(diags, s["subject"], bools, consts)
			for arm in s["arms"]:
				_bool_scan(diags, arm["body"], bools, consts)


static func _bool_expr(diags, e, bools, consts):
	var kind = e.get("kind")
	if kind == "binary":
		var op = e.get("op")
		if (op == "<=" or op == ">=") and _bool_side(e["left"], bools) and _bool_side(e["right"], bools):
			var msg = "Invalid operands \"bool\" and \"bool\" for \"" + op + "\" operator."
			if _foldable_bool(e["left"], consts) and _foldable_bool(e["right"], consts):
				msg = "Invalid operands to operator " + op + ", bool and bool."
			diags.append({"code": "bool-ordering", "message": msg, "loc": e["loc"]})
		_bool_expr(diags, e["left"], bools, consts)
		_bool_expr(diags, e["right"], bools, consts)
		return
	if kind == "unary":
		_bool_expr(diags, e["operand"], bools, consts)
		return
	if kind == "call":
		_bool_expr(diags, e["callee"], bools, consts)
		for a in e["args"]:
			_bool_expr(diags, a, bools, consts)
		return
	if kind == "attribute":
		_bool_expr(diags, e["obj"], bools, consts)
		return
	if kind == "index":
		_bool_expr(diags, e["obj"], bools, consts)
		_bool_expr(diags, e["index"], bools, consts)
		return
	if kind == "array":
		for it in e["items"]:
			_bool_expr(diags, it, bools, consts)
		return
	if kind == "dict":
		for en in e["entries"]:
			_bool_expr(diags, en["key"], bools, consts)
			_bool_expr(diags, en["value"], bools, consts)
		return
	if kind == "lambda":
		var inner = bools.duplicate()
		for p in e["params"]:
			if _bool_decl(p.get("type")):
				inner[p["name"]] = true
		_bool_scan(diags, e["body"], inner, consts)
		return
	if kind == "await":
		_bool_expr(diags, e["operand"], bools, consts)
		return


static func _bool_classes(diags, list, inherited, consts):
	for c in list:
		var bools = inherited.duplicate()
		for v in c["vars"]:
			if _bool_decl(v.get("type")):
				bools[v["name"]] = true
		for f in c["funcs"]:
			var params = bools.duplicate()
			for p in f["params"]:
				if _bool_decl(p.get("type")):
					params[p["name"]] = true
			_bool_scan(diags, f["body"], params, consts)
		_bool_classes(diags, c["innerClasses"], bools, consts)


static func check_bool_ordering(m, diags):
	var module_bools = {}
	var const_bools = {}
	for v in m["vars"]:
		if _bool_decl(v.get("type")):
			module_bools[v["name"]] = true
			if v.get("isConst") == true:
				const_bools[v["name"]] = true
	for f in m["funcs"]:
		var bools = module_bools.duplicate()
		for p in f["params"]:
			if _bool_decl(p.get("type")):
				bools[p["name"]] = true
		_bool_scan(diags, f["body"], bools, const_bools)
	_bool_classes(diags, m["innerClasses"], module_bools, const_bools)


static func check_percent_format(m, diags):
	for nodes in WK.flatten_bodies(m):
		for n in nodes:
			if n.get("kind") != "binary" or n.get("op") != "%":
				continue
			var left = n["left"]
			var right = n["right"]
			if left.get("kind") != "lit":
				continue
			if left.get("lit") != "string" and left.get("lit") != "string_name":
				continue
			if right.get("kind") == "array" or right.get("kind") == "dict":
				continue
			var arg = SL.pct_arg(right)
			if arg == null:
				continue
			var slots = SL.pct_slots(String(left["value"]))
			var message = null
			var used = 0
			for slot in slots:
				if slot["kind"] != "tail":
					if used >= 1:
						message = SL.pct_not_enough()
						break
					used += 1
					message = SL.pct_slot_message(slot, arg)
				else:
					message = SL.pct_slot_message(slot, arg)
				if message != null:
					break
			if message == null and used == 0:
				message = SL.pct_not_all()
			if message != null:
				diags.append({"code": "pct-format", "message": message, "loc": n.get("loc")})


static func _pairs_of(table, op, pair):
	var list = table.get(op)
	if list == null:
		return false
	return list.has(pair)


static func _scalar(t):
	return t == "bool" or t == "int" or t == "float"


static func _str_like(t):
	return t == "String" or t == "StringName"


static func _literal_or_static(e):
	var l = FC.literal_type_name(e)
	if l == null:
		l = AR.face_ctor_literal(e)
	if l == null:
		l = FC.static_type(e)
	return l


static func check_operator(e, diags):
	var l = _literal_or_static(e["left"])
	var r = _literal_or_static(e["right"])
	var pair = null
	if l != null and r != null:
		pair = l + "|" + r
	var op = e.get("op")
	var covered = false
	if op == "%" and (l == "float" or r == "float") and _scalar(l) and _scalar(r):
		covered = true
	if (op == "==" or op == "!=") and ((l == "String" and (r == "int" or r == "float")) or (r == "String" and (l == "int" or l == "float"))):
		covered = true
	if (op == "<=" or op == ">=") and l == "bool" and r == "bool":
		covered = true
	var paired = false
	if not covered and (LT.is_literal_operand(e["left"]) or AR.face_ctor_literal(e["left"]) != null) and (LT.is_literal_operand(e["right"]) or AR.face_ctor_literal(e["right"]) != null) and pair != null and l != null and r != null:
		if _pairs_of(O.OP_REFUSED_A, op, pair):
			paired = true
			diags.append({"code": "op-pair", "message": "Invalid operands to operator " + op + ", " + l + " and " + r + ".", "loc": e["loc"]})
		elif _pairs_of(O.OP_REFUSED_B, op, pair):
			paired = true
			diags.append({"code": "op-pair", "message": "Invalid operands \"" + l + "\" and \"" + r + "\" for \"" + op + "\" operator.", "loc": e["loc"]})
	var is_modulo = not _str_like(l) and not _str_like(r)
	if not paired and op == "%" and is_modulo and l != null and r != null and (l == "float" or r == "float"):
		diags.append({"code": "op-mod-float", "message": "Invalid operands to operator %, " + l + " and " + r + ".", "loc": e["loc"]})
	if op == "==" or op == "!=":
		if (l == "String" and (r == "int" or r == "float")) or (r == "String" and (l == "int" or l == "float")):
			diags.append({"code": "op-eq-cross-type", "message": "Invalid operands to operator " + op + ", " + l + " and " + r + ".", "loc": e["loc"]})
	if op == ">>" or op == "<<":
		if LT.is_negative_literal(e["left"]) or LT.is_negative_literal(e["right"]):
			diags.append({"code": "op-shift-negative", "message": "Invalid operands for bit shifting. Only positive operands are supported. in operator " + op + ".", "loc": e["loc"]})
	var left = e["left"]
	var right = e["right"]
	if (op == "/" or op == "%") and left.get("kind") == "lit" and (left.get("lit") == "int" or left.get("lit") == "float") and right.get("kind") == "lit" and right.get("lit") == "int" and float(right.get("value")) == 0.0:
		if not (op == "%" and left.get("lit") != "int"):
			if op == "/":
				diags.append({"code": "div-by-zero", "message": "Division by zero error in operator /.", "loc": e["loc"]})
			else:
				diags.append({"code": "mod-by-zero", "message": "Modulo by zero error in operator %.", "loc": e["loc"]})


static func _literal_kind(e):
	var l = FC.literal_type_name(e)
	if l != null:
		return l
	return FC.static_type(e)


static func _face_of(cx, e):
	var kind = e.get("kind")
	if kind == "ident":
		return cx["types"].get(e["name"])
	if kind == "index":
		return _elem_of(cx, e)
	return FC.static_type(e)


static func _callable_of(cx, e):
	if e.get("kind") != "attribute":
		return null
	var face = _face_of(cx, e["obj"])
	if face == null:
		return null
	var nm = e.get("name")
	if nm == null:
		return null
	var members = T.BUILTIN_INSTANCE_MEMBERS.get(face)
	if members == null or not members.has(nm):
		return null
	var props = O.BUILTIN_INSTANCE_PROPS.get(face)
	if props != null and props.has(nm):
		var by = T.BUILTIN_MEMBER_TYPES.get(face)
		var t = by.get(nm) if by != null else null
		if t != null and ANNOT.has(t):
			return t
		return null
	return "Callable"


static func _call_ret(cx, e):
	if e.get("kind") != "call" or e["callee"].get("kind") != "attribute":
		return null
	var face = _face_of(cx, e["callee"]["obj"])
	if face == null:
		return null
	var by = T.BUILTIN_METHOD_RETURNS.get(face)
	if by == null:
		return null
	var name = e["callee"].get("name")
	if name == null:
		return null
	return by.get(name)


static func _pack_ctor_face(e):
	if e.get("kind") == "call" and e["callee"].get("kind") == "ident" and T.PACK_TYPE_NAMES.has(e["callee"]["name"]):
		return e["callee"]["name"]
	return null


static func _elem_of(cx, e):
	if e.get("kind") != "index" or e["obj"].get("kind") != "ident":
		return null
	var slot = ST.parse_typed(cx["raws"].get(e["obj"]["name"], ""))
	if slot == null:
		return null
	var kt = FC.static_type(e["index"])
	if slot["kind"] == "Array":
		if kt != null and kt != "int":
			return null
		var el = slot.get("elem")
		if el != null and ANNOT.has(el):
			return el
		return null
	var key = slot.get("key")
	var val = slot.get("val")
	if key == null or val == null or not ANNOT.has(val):
		return null
	if kt != null and not SL.can_hold(key, kt):
		return null
	return val


static func _operand_kind(cx, e):
	var lit = _literal_kind(e)
	if lit != null:
		return lit
	if e.get("kind") == "ident":
		var nm = cx["types"].get(e["name"])
		if nm == null:
			nm = cx["consts"].get(e["name"])
		if nm != null:
			return nm
	var a = _call_ret(cx, e)
	if a != null:
		return a
	a = _pack_ctor_face(e)
	if a != null:
		return a
	a = _callable_of(cx, e)
	if a != null:
		return a
	return _elem_of(cx, e)


static func _disp_of(cx, e, base):
	if e.get("kind") == "ident":
		var raw = cx["raws"].get(e["name"])
		if raw != null:
			return raw
	return base


static func _left_kind(cx, left, consts):
	var kind = left.get("kind")
	if kind == "ident":
		var name = left["name"]
		if consts.has(name):
			return consts.get(name)
		return cx["types"].get(name)
	if kind == "index":
		return _elem_of(cx, left)
	if kind == "call":
		var a = _call_ret(cx, left)
		if a == null:
			a = _literal_kind(left)
		if a == null:
			a = _pack_ctor_face(left)
		return a
	return _callable_of(cx, left)


static func _right_kind(cx, right):
	var kind = right.get("kind")
	if kind == "ident":
		return cx["types"].get(right["name"])
	if kind == "index":
		return _elem_of(cx, right)
	if kind == "call":
		var a = _call_ret(cx, right)
		if a == null:
			a = _literal_kind(right)
		if a == null:
			a = _pack_ctor_face(right)
		return a
	return _callable_of(cx, right)


static func _check_operand_body(diags, body, base, consts, module_raws):
	var types = base.duplicate()
	var raws = module_raws.duplicate()
	var nodes = WK.flatten_body(body)
	for n in nodes:
		if n.get("kind") != "var" or n.get("name") == null or n.get("isConst") == true:
			continue
		var rw = _raw_of(n.get("type"))
		if rw != null:
			raws[n["name"]] = rw
		var t = _named(n.get("type"))
		if t != null:
			types[n["name"]] = t
	var cx = {"types": types, "consts": consts, "raws": raws}
	var reported = {}
	for i in nodes.size():
		var n = nodes[i]
		if n.get("kind") != "binary":
			continue
		var e = n
		if LT.is_literal_operand(e["left"]) and LT.is_literal_operand(e["right"]):
			continue
		var lk = e["left"].get("kind")
		if lk != "ident" and lk != "index" and lk != "call" and lk != "attribute":
			continue
		var rk1 = _operand_kind(cx, e["right"])
		if rk1 == null:
			continue
		var is_ident = e["left"].get("kind") == "ident"
		var name = e["left"]["name"] if is_ident else ""
		var is_const = is_ident and consts.has(name)
		var lt = _left_kind(cx, e["left"], consts)
		if lt == null:
			continue
		var op = e.get("op")
		var pair = lt + "|" + rk1
		var folded_a = is_const and _pairs_of(O.OP_CONST_A, op, pair)
		var folded_b = is_const and _pairs_of(O.OP_CONST_B, op, pair)
		var declared_b = false
		if not is_const:
			declared_b = _pairs_of(O.OP_REFUSED_DECL, op, pair) or _pairs_of(O.OP_REFUSED_DECL_VAL, op, pair) or _pairs_of(O.OP_REFUSED_CALLABLE, op, pair)
		if not folded_a and not folded_b and not declared_b:
			continue
		var msg = "Invalid operands \"" + _disp_of(cx, e["left"], lt) + "\" and \"" + _disp_of(cx, e["right"], rk1) + "\" for \"" + op + "\" operator."
		if folded_a:
			msg = "Invalid operands to operator " + op + ", " + lt + " and " + rk1 + "."
		diags.append({"code": "op-pair", "message": msg, "loc": e.get("loc")})
		reported[i] = true
	for i in nodes.size():
		var n = nodes[i]
		if n.get("kind") != "binary":
			continue
		if reported.has(i):
			continue
		var e = n
		if LT.is_literal_operand(e["left"]) and LT.is_literal_operand(e["right"]):
			continue
		var rk = e["right"].get("kind")
		if rk != "ident" and rk != "index" and rk != "call" and rk != "attribute":
			continue
		var lt2 = _operand_kind(cx, e["left"])
		if lt2 == null:
			continue
		var rt2 = _right_kind(cx, e["right"])
		if rt2 == null:
			continue
		var op2 = e.get("op")
		var pair2 = lt2 + "|" + rt2
		if not _pairs_of(O.OP_REFUSED_DECL, op2, pair2) and not _pairs_of(O.OP_REFUSED_DECL_VAL_REV, op2, pair2) and not _pairs_of(O.OP_REFUSED_CALLABLE, op2, pair2):
			continue
		diags.append({
			"code": "op-pair",
			"message": "Invalid operands \"" + _disp_of(cx, e["left"], lt2) + "\" and \"" + _disp_of(cx, e["right"], rt2) + "\" for \"" + op2 + "\" operator.",
			"loc": e.get("loc"),
		})


static func check_operand_pairs(m, diags):
	var module_types = {}
	var module_consts = {}
	var module_raws = {}
	for v in m["vars"]:
		var rw = _raw_of(v.get("type"))
		if rw != null:
			module_raws[v["name"]] = rw
		var t = _named(v.get("type"))
		if t == null:
			continue
		if v.get("isConst") == true:
			module_consts[v["name"]] = t
		else:
			module_types[v["name"]] = t
	for f in m["funcs"]:
		var types = module_types.duplicate()
		for p in f["params"]:
			var t = _named(p.get("type"))
			if t != null:
				types[p["name"]] = t
		_check_operand_body(diags, f["body"], types, module_consts, module_raws)
	_op_classes(diags, m["innerClasses"], module_raws)


static func _op_classes(diags, list, module_raws):
	for c in list:
		var fields = {}
		for v in c["vars"]:
			var t = _named(v.get("type"))
			if t != null and v.get("isConst") != true:
				fields[v["name"]] = t
		for f in c["funcs"]:
			var types = fields.duplicate()
			for p in f["params"]:
				var t = _named(p.get("type"))
				if t != null:
					types[p["name"]] = t
			_check_operand_body(diags, f["body"], types, {}, module_raws)
		_op_classes(diags, c["innerClasses"], module_raws)


static func _pack_ann(t):
	if t != null and t.get("kind") == "named" and T.PACK_TYPE_NAMES.has(t["name"]):
		return t["name"]
	return null


static func _starts_name(name, base):
	if name == base:
		return true
	return name.begins_with(base + "[")


static func _shape_ann(t):
	if t == null or t.get("kind") != "named":
		return null
	var n = t["name"]
	if _starts_name(n, "Array"):
		return "Array"
	if _starts_name(n, "Dictionary"):
		return "Dictionary"
	if T.PACK_TYPE_NAMES.has(n):
		return "Pack"
	return null


static func _void_target(f, fields, shape_fields):
	var ps = fields.duplicate()
	var cs = shape_fields.duplicate()
	for p in f["params"]:
		var ty = _pack_ann(p.get("type"))
		if ty != null:
			ps[p["name"]] = ty
		var sh = _shape_ann(p.get("type"))
		if sh != null:
			cs[p["name"]] = sh
	return {"body": f["body"], "pack_seed": ps, "shape_seed": cs}


static func _void_class_targets(targets, list):
	for c in list:
		var fields = {}
		var shape_fields = {}
		for v in c["vars"]:
			var ty = _pack_ann(v.get("type"))
			if ty != null:
				fields[v["name"]] = ty
			var sh = _shape_ann(v.get("type"))
			if sh != null:
				shape_fields[v["name"]] = sh
		for f in c["funcs"]:
			targets.append(_void_target(f, fields, shape_fields))
		_void_class_targets(targets, c["innerClasses"])


static func _class_names(out, list):
	for c in list:
		out[c["name"]] = true
		_class_names(out, c["innerClasses"])


static func _signal_names(out, list):
	for c in list:
		for s in c["signals"]:
			out[s["name"]] = true
		_signal_names(out, c["innerClasses"])


static func _void_shape_of(cx, e):
	var kind = e.get("kind")
	if kind == "array":
		return "Array"
	if kind == "dict":
		return "Dictionary"
	if kind == "call" and e["callee"].get("kind") == "ident":
		var cn = e["callee"]["name"]
		if cn == "Callable":
			return "Callable"
		if cn == "Signal":
			return "SignalDyn"
		if O.PACK_SHAPE_NAMES.has(cn):
			return "Pack"
	if kind == "ident" and cx["signals"].has(e["name"]):
		return "SignalDyn"
	if kind == "call" and e["callee"].get("kind") == "attribute" and e["callee"].get("name") == "new" and e["callee"]["obj"].get("kind") == "ident" and cx["classes"].has(e["callee"]["obj"]["name"]):
		return "Object"
	return null


static func _void_owner(cx, obj):
	var kind = obj.get("kind")
	if kind == "lit":
		if obj.get("lit") == "string":
			return "String"
		return null
	if kind == "ident" and obj.get("name") != null:
		var n = obj["name"]
		var v = cx["local"].get(n)
		if v == null:
			v = cx["mod"].get(n)
		if v == null:
			v = cx["packs"].get(n)
		return v
	if kind == "call" and obj["callee"].get("kind") == "ident" and T.PACK_TYPE_NAMES.has(obj["callee"]["name"]):
		return obj["callee"]["name"]
	if kind == "call":
		if obj["callee"].get("kind") != "attribute":
			return null
		return FC.chain_recv_face(obj, _void_owner(cx, obj["callee"]["obj"]))
	return null


static func _void_method_void(shape, name):
	if shape == "Pack":
		return O.VOID_BYTES_METHODS.has(name)
	if shape == "Object":
		return O.VOID_OBJECT_METHODS.has(name)
	if shape == "Signal" or shape == "SignalDyn":
		return O.VOID_SIGNAL_METHODS.has(name)
	if shape == "Callable":
		return O.VOID_CALLABLE_METHODS.has(name)
	if shape == "Array":
		return O.VOID_ARRAY_METHODS.has(name)
	if shape == "Dictionary":
		return O.VOID_DICT_METHODS.has(name)
	return false


static func _void_call_shape(cx, shapes, callee):
	var obj = callee["obj"]
	var chain_pack = null
	if obj.get("kind") == "call" and T.PACK_TYPE_NAMES.has(_void_owner(cx, obj)):
		chain_pack = "Pack"
	var ctor_call = false
	if obj.get("kind") == "call" and obj["callee"].get("kind") == "ident" and obj["callee"].get("name") == "Callable":
		ctor_call = true
	var okind = obj.get("kind")
	if okind == "ident":
		var n = obj["name"]
		var sh = shapes.get(n)
		if sh != null:
			return sh
		if T.PACK_TYPE_NAMES.has(n):
			return "Pack"
		if n == "Array" or n == "Dictionary":
			return n
		if cx["signals"].has(n):
			return "Signal"
		return null
	if okind == "array":
		return "Array"
	if okind == "dict":
		return "Dictionary"
	if chain_pack != null:
		return chain_pack
	if ctor_call:
		return "Callable"
	return null


static func _void_expr(diags, e, discarded, cx, shapes):
	var kind = e.get("kind")
	if kind == "call":
		var callee = e["callee"]
		if callee.get("kind") == "attribute":
			var okind = callee["obj"].get("kind")
			if okind == "ident" or okind == "call" or okind == "array" or okind == "dict":
				var name = callee.get("name")
				var shape = _void_call_shape(cx, shapes, callee)
				if shape == "Signal" and O.SIGNAL_PARSE_MISSING.has(name):
					diags.append({"code": "signal-member-missing", "message": "Cannot find member \"" + name + "\" in base \"Signal\".", "loc": e["loc"]})
					diags.append({"code": "signal-member-not-found", "message": "Function \"" + name + "()\" not found in base Signal.", "loc": e["loc"]})
				var sig_max = null
				if shape == "Signal" or shape == "SignalDyn":
					sig_max = O.SIGNAL_PARSE_ARITY_MAX.get(name)
				if sig_max != null and e["args"].size() > sig_max:
					diags.append({
						"code": "signal-arity",
						"message": "Too many arguments for \"" + name + "()\" call. Expected at most " + str(sig_max) + " but received " + str(e["args"].size()) + ".",
						"loc": e["loc"],
					})
				if shape == "Callable":
					var d = AR.arity_diag(O.CALLABLE_PARSE_ARITY, "callable-arity", name, e["args"].size(), e["loc"])
					if d != null:
						diags.append(d)
					for row in O.CALLABLE_PARSE_ARGS.get(name, []):
						var pos = row[0]
						var refuse = row[1]
						var want = row[2]
						var bad = FC.literal_type_name(e["args"][pos - 1])
						if bad == null or not refuse.has(bad):
							continue
						diags.append({"code": "callable-arg-pass", "message": "Cannot pass a value of type \"" + bad + "\" as \"" + want + "\".", "loc": e["loc"]})
						diags.append({
							"code": "callable-arg-type",
							"message": "Invalid argument for \"" + name + "()\" function: argument " + str(pos) + " should be \"" + want + "\" but is \"" + bad + "\".",
							"loc": e["loc"],
						})
				if not discarded and _void_method_void(shape, name):
					diags.append({"code": "void-method-value", "message": "Cannot get return value of call to \"" + name + "()\" because it returns \"void\".", "loc": e["loc"]})
		_void_expr(diags, e["callee"], false, cx, shapes)
		for a in e["args"]:
			_void_expr(diags, a, false, cx, shapes)
		return
	if kind == "index":
		_void_expr(diags, e["obj"], false, cx, shapes)
		_void_expr(diags, e["index"], false, cx, shapes)
		return
	if kind == "attribute":
		_void_expr(diags, e["obj"], false, cx, shapes)
		return
	if kind == "binary":
		_void_expr(diags, e["left"], false, cx, shapes)
		_void_expr(diags, e["right"], false, cx, shapes)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_void_expr(diags, e["operand"], false, cx, shapes)
		return
	if kind == "array":
		for it in e["items"]:
			_void_expr(diags, it, false, cx, shapes)
		return
	if kind == "dict":
		for en in e["entries"]:
			_void_expr(diags, en["key"], false, cx, shapes)
			_void_expr(diags, en["value"], false, cx, shapes)
		return
	if kind == "lambda":
		for p in e["params"]:
			var t = p.get("type")
			var sh = _shape_ann(t)
			if sh != null:
				shapes[p["name"]] = sh
		_void_stmts(diags, e["body"], cx, shapes)
		return


static func _void_stmts(diags, ss, cx, shapes):
	for s in ss:
		var kind = s.get("kind")
		if kind == "var":
			var ty = s.get("type")
			if ty != null and ty.get("kind") == "named":
				var sh = _shape_ann(ty)
				if sh != null:
					shapes[s["name"]] = sh
				elif ty["name"] == "Signal":
					shapes[s["name"]] = "Signal"
				elif ty["name"] == "Callable":
					shapes[s["name"]] = "Callable"
			elif s.get("init") != null:
				var inferred = _void_shape_of(cx, s["init"])
				if inferred != null:
					shapes[s["name"]] = inferred
			if s.get("init") != null:
				_void_expr(diags, s["init"], false, cx, shapes)
			continue
		if kind == "assign":
			if s["target"].get("kind") == "ident":
				var sh2 = _void_shape_of(cx, s["value"])
				if sh2 == null:
					shapes.erase(s["target"]["name"])
				else:
					shapes[s["target"]["name"]] = sh2
			_void_expr(diags, s["target"], false, cx, shapes)
			_void_expr(diags, s["value"], false, cx, shapes)
			continue
		if kind == "expr":
			_void_expr(diags, s["expr"], true, cx, shapes)
			continue
		if kind == "return":
			if s.get("value") != null:
				_void_expr(diags, s["value"], false, cx, shapes)
			continue
		if kind == "if":
			for b in s["branches"]:
				if b.get("cond") != null:
					_void_expr(diags, b["cond"], false, cx, shapes)
				_void_stmts(diags, b["body"], cx, shapes)
			continue
		if kind == "for":
			_void_expr(diags, s["iter"], false, cx, shapes)
			_void_stmts(diags, s["body"], cx, shapes)
			continue
		if kind == "while":
			_void_expr(diags, s["cond"], false, cx, shapes)
			_void_stmts(diags, s["body"], cx, shapes)
			continue
		if kind == "match":
			_void_expr(diags, s["subject"], false, cx, shapes)
			for arm in s["arms"]:
				if arm.get("guard") != null:
					_void_expr(diags, arm["guard"], false, cx, shapes)
				_void_stmts(diags, arm["body"], cx, shapes)
			continue


static func _void_body(diags, t, seed_shapes, mod_ann, class_names, signal_names):
	var shapes = seed_shapes.duplicate()
	for name in t["pack_seed"]:
		shapes[name] = "Pack"
	for name in t["shape_seed"]:
		shapes[name] = t["shape_seed"][name]
	var local_ann = {}
	for n in WK.flatten_body(t["body"]):
		if n.get("kind") == "var" and n.get("name") != null:
			var f = FC.known_face_annotation(n.get("type"))
			if f != null:
				local_ann[n["name"]] = f
	var cx = {"local": local_ann, "mod": mod_ann, "packs": t["pack_seed"], "classes": class_names, "signals": signal_names}
	_void_stmts(diags, t["body"], cx, shapes)


static func check_void_method_values(m, diags):
	var class_names = {}
	if m.get("className") != null:
		class_names[m["className"]] = true
	_class_names(class_names, m["innerClasses"])
	var signal_names = {}
	for s in m["signals"]:
		signal_names[s["name"]] = true
	_signal_names(signal_names, m["innerClasses"])
	var mod_ann = {}
	for v in m["vars"]:
		var f = FC.known_face_annotation(v.get("type"))
		if f != null:
			mod_ann[v["name"]] = f
	var seed_shapes = {}
	for v in m["vars"]:
		var sh = _shape_ann(v.get("type"))
		if sh != null:
			seed_shapes[v["name"]] = sh
	var targets = []
	for f in m["funcs"]:
		targets.append(_void_target(f, {}, {}))
	_void_class_targets(targets, m["innerClasses"])
	for t in targets:
		_void_body(diags, t, seed_shapes, mod_ann, class_names, signal_names)
