const NF = preload("res://numfmt.gd")
const G = preload("res://globals.gd")
const SL = preload("res://slots.gd")


static func typed_face_text(name):
	var open = name.find("[")
	var closed = name.strip_edges()
	if open < 0 or not closed.ends_with("]"):
		return name.strip_edges()
	var base = name.substr(0, open).strip_edges()
	var body = closed.substr(open + 1, closed.length() - open - 2)
	var parts = []
	var depth = 0
	var cur = ""
	for ch in body:
		if ch == "[":
			depth += 1
		elif ch == "]":
			depth -= 1
		if ch == "," and depth == 0:
			parts.append(cur)
			cur = ""
			continue
		cur += ch
	parts.append(cur)
	var mapped = []
	for p in parts:
		mapped.append(typed_face_text(p.strip_edges()))
	var all_variant = mapped.size() > 0
	for m in mapped:
		if m != "Variant":
			all_variant = false
	if all_variant:
		return base
	var joined = ""
	for i in mapped.size():
		if i > 0:
			joined += ", "
		joined += mapped[i]
	return base + "[" + joined + "]"


static func dict_key_token(k):
	if k["t"] == "int":
		return "i:" + str(k["v"])
	if k["t"] == "float":
		return "f:" + str(k["v"])
	if k["t"] == "str":
		return "s:" + k["v"]
	if k["t"] == "bool":
		return "b:" + ("1" if k["v"] else "0")
	if k["t"] == "null":
		return "n"
	if k["t"] == "vec":
		var xs = ""
		for i in k["xs"].size():
			if i > 0:
				xs += ","
			xs += num_join(k["xs"][i])
		return "v:" + k["name"] + ":" + xs
	return "p:" + k["v"]


static func dict_key_text(k):
	if k["t"] == "int":
		return str(k["v"])
	if k["t"] == "float":
		return float_text(k["v"])
	if k["t"] == "str":
		return k["v"]
	if k["t"] == "bool":
		return "true" if k["v"] else "false"
	if k["t"] == "null":
		return "<null>"
	if k["t"] == "vec":
		var xs = ""
		for i in k["xs"].size():
			if i > 0:
				xs += ", "
			xs += float_text(k["xs"][i])
		return "(" + xs + ")"
	return k["v"]


static func num_join(x):
	if x == floor(x):
		return str(int(x))
	return str(x)


static func float_text(v):
	if v == 0.0 and (1.0 / v) < 0.0:
		return "0.0"
	return NF.str_float(v)


static func is_num(t):
	return t == "int" or t == "float"


static func is_negative_literal(e):
	if e["kind"] == "lit" and (e["lit"] == "int" or e["lit"] == "float"):
		return float(e["value"]) < 0.0
	if e["kind"] == "unary" and e["op"] == "-":
		return true
	return false


static func numeric_literal_kind(e):
	if e["kind"] != "lit":
		return null
	if e["lit"] == "int":
		return "int"
	if e["lit"] == "float":
		return "float"
	return null


static func literal_face_text(e, kind):
	if e.get("kind") == "array":
		for it in e["items"]:
			if SL.slot_source(it) != "int":
				return kind
		return "Array[int]"
	if e.get("kind") == "dict":
		for en in e["entries"]:
			if SL.slot_source(en["key"]) != "int":
				return kind
		return "Dictionary[int, Variant]"
	return kind


static func non_numeric_literal(e):
	if e["kind"] == "lit":
		if e["lit"] == "string":
			return "String"
		if e["lit"] == "string_name":
			return "StringName"
		if e["lit"] == "node_path":
			return "NodePath"
		if e["lit"] == "null":
			return "null"
		return null
	if e["kind"] == "array":
		return "Array"
	if e["kind"] == "dict":
		return "Dictionary"
	if e["kind"] == "call" and e["callee"]["kind"] == "ident" and G.NUMERIC_VALUE_CTORS.has(e["callee"]["name"]):
		return e["callee"]["name"]
	return null


static func value_ctor_type(e):
	if e != null and e["kind"] == "call" and e["callee"]["kind"] == "ident" and G.VALUE_CTOR_NAMES.has(e["callee"]["name"]):
		return e["callee"]["name"]
	return null


static func is_literal_operand(e):
	if e["kind"] == "lit" or e["kind"] == "array" or e["kind"] == "dict":
		return true
	return value_ctor_type(e) != null


static func err_unported():
	return {"__error": "analyze-static-type", "message": "literal_face_text 要 slotSource / staticType，还没搬"}
