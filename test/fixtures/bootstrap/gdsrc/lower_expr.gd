const C = preload("res://cst.gd")
const LI = preload("res://lit.gd")
const DB = preload("res://double.gd")


static func err(code, message):
	return {"__error": code, "message": message}


static func is_error(v):
	return v is Dictionary and v.has("__error")


static func lower_expr(n, idx):
	var c = C.loc(n)
	var t = n["type"]
	if t == "integer":
		return {"kind": "lit", "lit": "int", "value": LI.lower_int_lit(n["text"]), "loc": c}
	if t == "float":
		return {"kind": "lit", "lit": "float", "value": DB.parse_gd_double(n["text"]), "loc": c}
	if t == "string":
		var sv = LI.unquote(n["text"])
		if sv is Dictionary:
			return sv
		return {"kind": "lit", "lit": "string", "value": sv, "loc": c}
	if t == "string_name":
		var sn = LI.unquote(LI.strip_amp(n["text"]))
		if sn is Dictionary:
			return sn
		return {"kind": "lit", "lit": "string_name", "value": sn, "loc": c}
	if t == "node_path":
		var np = LI.unquote(LI.strip_caret(n["text"]))
		if np is Dictionary:
			return np
		return {"kind": "lit", "lit": "node_path", "value": np, "loc": c}
	if t == "true":
		return {"kind": "lit", "lit": "bool", "value": true, "loc": c}
	if t == "false":
		return {"kind": "lit", "lit": "bool", "value": false, "loc": c}
	if t == "null":
		return {"kind": "lit", "lit": "null", "value": null, "loc": c}
	if t == "identifier":
		return {"kind": "ident", "name": n["text"], "loc": c}
	if t == "parenthesized_expression":
		var kids = C.named(n)
		if kids.is_empty():
			return err("missing-field", "括号表达式")
		return lower_expr(kids[0], idx)
	if t == "unary_operator":
		var kids2 = C.named(n)
		if kids2.is_empty():
			return err("missing-field", "一元操作数")
		if not C.in_brackets(n, idx):
			var tok = _anon_child(n)
			var bad = C.check_after_token(n, tok, kids2[0], "Expected expression after operator.")
			if bad != null:
				return bad
		return {"kind": "unary", "op": C.operator_of(n), "operand": lower_expr(kids2[0], idx), "loc": c}
	if t == "conditional_expression":
		var kids3 = C.named(n)
		if kids3.size() != 3:
			return err("ternary", "三目的形状没量过")
		return {"kind": "ternary", "cond": lower_expr(kids3[1], idx), "thenE": lower_expr(kids3[0], idx), "elseE": lower_expr(kids3[2], idx), "loc": c}
	if t == "await_expression":
		var kids4 = C.named(n)
		if kids4.is_empty():
			return err("missing-field", "await 操作数")
		return {"kind": "await", "operand": lower_expr(kids4[0], idx), "loc": c}
	if t == "lambda":
		var L = load("res://lower.gd")
		var plist = []
		var params_node = C.field(n, "parameters")
		if params_node != null:
			for pc in C.named(params_node):
				plist.append(L.lower_param(pc, idx))
				if L.failed:
					return L.last_error
		var body_node = C.field(n, "body")
		if body_node == null:
			return err("missing-field", "lambda 体")
		var body = L.lower_body(body_node, idx)
		if L.failed:
			return L.last_error
		return {"kind": "lambda", "params": plist, "body": body, "loc": c}
	if t == "array":
		var items = []
		for kid in C.named(n):
			var v = lower_expr(kid, idx)
			if is_error(v):
				return v
			items.append(v)
		return {"kind": "array", "items": items, "loc": c}
	if t == "dictionary":
		var entries = []
		for pair in C.named(n):
			var left = C.field(pair, "left")
			if left == null:
				var nk = C.named(pair)
				left = null if nk.is_empty() else nk[0]
			var right = C.field(pair, "value")
			if right == null:
				var nv = C.named(pair)
				right = null if nv.size() < 2 else nv[1]
			if left == null or right == null:
				return err("missing-field", "字典键值")
			var kv = lower_expr(left, idx)
			if is_error(kv):
				return kv
			var vv = lower_expr(right, idx)
			if is_error(vv):
				return vv
			entries.append({"key": kv, "value": vv})
		return {"kind": "dict", "entries": entries, "loc": c}
	if t == "subscript":
		var obj = C.named(n)
		if obj.is_empty():
			return err("missing-field", "下标对象")
		var args = C.field(n, "arguments")
		var idx_node = null
		if args != null:
			var an = C.named(args)
			idx_node = null if an.is_empty() else an[0]
		if idx_node == null:
			return err("missing-field", "下标")
		return {"kind": "index", "obj": lower_expr(obj[0], idx), "index": lower_expr(idx_node, idx), "loc": c}
	if t == "attribute":
		var segs = C.named(n)
		if segs.is_empty():
			return err("attribute", "空的属性访问")
		var acc = lower_expr(segs[0], idx)
		if is_error(acc):
			return acc
		for i in range(1, segs.size()):
			var seg = segs[i]
			if seg["type"] == "attribute_call":
				var nm = C.named(seg)
				if nm.is_empty():
					return err("missing-field", "方法名")
				var args_node = C.field(seg, "arguments")
				var call_args = []
				if args_node != null:
					for a in C.named(args_node):
						var av = lower_expr(a, idx)
						if is_error(av):
							return av
						call_args.append(av)
				acc = {"kind": "call", "callee": {"kind": "attribute", "obj": acc, "name": nm[0]["text"], "loc": C.loc(seg)}, "args": call_args, "loc": c}
			elif seg["type"] == "attribute_subscript":
				var parts = C.named(seg)
				if parts.is_empty():
					return err("missing-field", "attribute_subscript 的属性名")
				var args_node2 = C.field(seg, "arguments")
				var holder = args_node2
				if holder == null and parts.size() > 1:
					holder = parts[1]
				var idx_node2 = null
				if holder != null:
					var hn = C.named(holder)
					idx_node2 = null if hn.is_empty() else hn[0]
				if idx_node2 == null:
					return err("missing-field", "attribute_subscript 的下标")
				acc = {"kind": "index", "obj": {"kind": "attribute", "obj": acc, "name": parts[0]["text"], "loc": c}, "index": lower_expr(idx_node2, idx), "loc": c}
			else:
				acc = {"kind": "attribute", "obj": acc, "name": seg["text"], "loc": c}
			if is_error(acc):
				return acc
		return acc
	if t == "call":
		var kids5 = C.named(n)
		if kids5.is_empty():
			return err("missing-field", "被调用者")
		var callee = lower_expr(kids5[0], idx)
		if is_error(callee):
			return callee
		var cargs = []
		for a2 in _call_args(n):
			var av2 = lower_expr(a2, idx)
			if is_error(av2):
				return av2
			cargs.append(av2)
		return {"kind": "call", "callee": callee, "args": cargs, "loc": c}
	if t == "binary_operator":
		return lower_binary(n, c, idx)
	return err("expr", "表达式 " + t + " 未支持")


static func _anon_child(n):
	for k in n["children"]:
		if not k["isNamed"]:
			return k
	return null


static func _call_args(n):
	var args_node = C.field(n, "arguments")
	return [] if args_node == null else C.named(args_node)


static func lower_binary(n, c, idx):
	var op = C.operator_of(n)
	if not C.in_brackets(n, idx):
		var tok = _anon_child(n)
		var right_field = C.field(n, "right")
		if tok != null and right_field != null:
			var bad = C.check_after_token(n, tok, right_field, "Expected expression after operator.")
			if bad != null:
				return bad
	var left_node = C.field(n, "left")
	if left_node == null:
		return err("missing-field", "左操作数")
	var right_node = C.field(n, "right")
	if right_node == null:
		return err("missing-field", "右操作数")
	var left = lower_expr(left_node, idx)
	if is_error(left):
		return left
	if op == "is":
		return {"kind": "is", "operand": left, "type": C.lower_type(right_node), "loc": c}
	if op == "as":
		return {"kind": "as", "operand": left, "type": C.lower_type(right_node), "loc": c}
	var right = lower_expr(right_node, idx)
	if is_error(right):
		return right
	return {"kind": "binary", "op": op, "left": left, "right": right, "loc": c}
