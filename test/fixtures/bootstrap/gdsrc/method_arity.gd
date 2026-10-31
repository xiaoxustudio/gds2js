const LF = preload("res://literals.gd")
const SL = preload("res://slots.gd")
const AR = preload("res://arity.gd")
const FC = preload("res://faces.gd")
const WK = preload("res://walk.gd")
const T = preload("res://arity_tables.gd")


static func check_dict_duplicate_keys(m):
	var diags = []
	_vars(diags, m["vars"])
	for f in m["funcs"]:
		_stmts(diags, f["body"])
	_classes(diags, m["innerClasses"])
	return diags


static func _expr(diags, e):
	if e == null or not (e is Dictionary):
		return
	var kind = e.get("kind")
	if kind == null:
		return
	if kind == "index":
		_expr(diags, e["obj"])
		_expr(diags, e["index"])
		return
	if kind == "attribute":
		_expr(diags, e["obj"])
		return
	if kind == "binary":
		_expr(diags, e["left"])
		_expr(diags, e["right"])
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_expr(diags, e["operand"])
		return
	if kind == "array":
		for it in e["items"]:
			_expr(diags, it)
		return
	if kind == "call":
		_expr(diags, e["callee"])
		for a in e["args"]:
			_expr(diags, a)
		return
	if kind == "dict":
		var seen = {}
		for en in e["entries"]:
			_expr(diags, en["key"])
			_expr(diags, en["value"])
			var key = SL.fold_dict_key(en["key"])
			if key == null:
				continue
			var token = LF.dict_key_token(key)
			if not seen.has(token):
				seen[token] = en["key"]["loc"]
			else:
				var first = seen[token]
				diags.append({"code": "dict-dup-key", "message": "Key \"" + LF.dict_key_text(key) + "\" was already used in this dictionary (at line " + str(first["line"]) + ").", "loc": en["key"]["loc"]})
		return
	if kind == "lambda":
		_stmts(diags, e["body"])
		return


static func _stmts(diags, body):
	for s in body:
		var kind = s["kind"]
		if kind == "expr":
			_expr(diags, s["expr"])
		elif kind == "var":
			_expr(diags, s["init"])
		elif kind == "assign":
			_expr(diags, s["target"])
			_expr(diags, s["value"])
		elif kind == "if":
			for br in s["branches"]:
				_expr(diags, br["cond"])
				_stmts(diags, br["body"])
		elif kind == "for":
			_expr(diags, s["iter"])
			_stmts(diags, s["body"])
		elif kind == "while":
			_expr(diags, s["cond"])
			_stmts(diags, s["body"])
		elif kind == "match":
			_expr(diags, s["subject"])
			for arm in s["arms"]:
				_expr(diags, arm["guard"])
				_stmts(diags, arm["body"])
		elif kind == "return":
			_expr(diags, s["value"])


static func _vars(diags, list):
	for v in list:
		_expr(diags, v["init"])
		var acc = v["accessor"]
		if acc != null:
			if acc["getter"] != null and acc["getter"]["kind"] == "inline":
				_stmts(diags, acc["getter"]["body"])
			if acc["setter"] != null and acc["setter"]["kind"] == "inline":
				_stmts(diags, acc["setter"]["body"])


static func _classes(diags, list):
	for c in list:
		_vars(diags, c["vars"])
		for f in c["funcs"]:
			_stmts(diags, f["body"])
		_classes(diags, c["innerClasses"])

static func check_dict_method_arity(m):
	var diags = []
	var assigned = WK.module_assigned_names(m)
	for scope in FC.face_scopes(m, "Dictionary", "dict"):
		var nodes = scope["nodes"]
		var seeded = scope["seeded"]
		var texts = scope["texts"].duplicate()
		var dicts = FC.face_receiver_names(nodes, seeded, assigned, "Dictionary", "dict")
		var dict_ann = FC.face_receiver_names(nodes, seeded, assigned, "Dictionary", "dict", true, texts)
		for n in nodes:
			var d = AR.container_call_arity(n, T.DICT_ARITY, "dict-arity", dicts, "dict")
			if d != null:
				diags.append(d)
			for g in AR.face_ghost_diags(n, T.DICT_ARITY, "Dictionary", false, dict_ann, "dict", texts):
				diags.append(g)
	return diags


static func check_array_method_arity(m):
	var diags = []
	var assigned = WK.module_assigned_names(m)
	for scope in FC.face_scopes(m, "Array", "array"):
		var nodes = scope["nodes"]
		var seeded = scope["seeded"]
		var texts = scope["texts"].duplicate()
		var arrays = FC.face_receiver_names(nodes, seeded, assigned, "Array", "array")
		var arr_ann = FC.face_receiver_names(nodes, seeded, assigned, "Array", "array", true, texts)
		for n in nodes:
			var d = AR.container_call_arity(n, T.ARRAY_ARITY, "array-arity", arrays, "array")
			if d != null:
				diags.append(d)
			for g in AR.face_ghost_diags(n, T.ARRAY_ARITY, "Array", true, arr_ann, "array", texts):
				diags.append(g)
	return diags
