const AS = preload("res://analyze_state.gd")
const O = preload("res://op_tables.gd")

const OBJECT_ARG_NAMES = {"Callable": true, "Object": true, "Node": true}
const VALUE_ARG_WANTS = {
	"int": true, "float": true, "bool": true, "String": true, "Vector2": true, "Vector2i": true, "Vector3": true, "Vector3i": true, "Color": true,
	"Array": true, "Dictionary": true,
	"PackedByteArray": true, "PackedInt32Array": true, "PackedInt64Array": true, "PackedFloat32Array": true, "PackedFloat64Array": true,
	"PackedStringArray": true, "PackedVector2Array": true, "PackedVector3Array": true, "PackedVector4Array": true, "PackedColorArray": true,
}
const PCT_VECTORS = {"Vector2": true, "Vector3": true, "Vector4": true, "Vector2i": true, "Vector3i": true, "Vector4i": true}
const PCT_VALUE_CTORS = {"Color": true, "Callable": true}
const PCT_NUMERIC = "dfoxX"
const PCT_MSG = {
	"unsupported": "unsupported format character in operator %.",
	"incomplete": "incomplete format in operator %.",
	"number": "a number is required in operator %.",
	"char": "%c requires number or single-character string in operator %.",
	"negative": "unsigned integer is lower than minimum in operator %.",
	"vector": "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator %.",
	"star": "* wants number or vector in operator %.",
	"notAll": "not all arguments converted during string formatting in operator %.",
	"notEnough": "not enough arguments for format string in operator %.",
}


static func null_refused_by_value_slot(want):
	return VALUE_ARG_WANTS.has(want)


static func object_name_refused_by_value_slot(src, want):
	return src != null and OBJECT_ARG_NAMES.has(src) and VALUE_ARG_WANTS.has(want)


static func pct_arg(e):
	if e.get("kind") == "lit":
		var lit = e.get("lit")
		if lit == "int" or lit == "float":
			var v = float(e["value"])
			return {"num": true, "neg": v < 0.0, "vec": false, "text": null}
		if lit == "string":
			return {"num": false, "neg": false, "vec": false, "text": str(e["value"])}
		if lit == "string_name" or lit == "node_path" or lit == "bool" or lit == "null":
			return {"num": false, "neg": false, "vec": false, "text": null}
		return null
	if e.get("kind") == "unary" and e.get("op") == "-":
		var inner = pct_arg(e["operand"])
		if inner == null or not inner["num"]:
			return null
		return {"num": inner["num"], "neg": not inner["neg"], "vec": inner["vec"], "text": inner["text"]}
	if e.get("kind") == "call" and e["callee"].get("kind") == "ident":
		var name = e["callee"]["name"]
		if PCT_VECTORS.has(name):
			return {"num": false, "neg": false, "vec": true, "text": null}
		if PCT_VALUE_CTORS.has(name):
			return {"num": false, "neg": false, "vec": false, "text": null}
	return null


static func pct_slot_message(slot, arg):
	if slot["kind"] == "tail":
		return PCT_MSG["incomplete"]
	if slot["kind"] == "star":
		if arg["num"] or arg["vec"]:
			return null
		return PCT_MSG["star"]
	var ch = slot["ch"]
	if ch == "s":
		return null
	if ch == "c":
		if arg["num"]:
			if arg["neg"]:
				return PCT_MSG["negative"]
			return null
		if arg["text"] != null and arg["text"].length() == 1:
			return null
		return PCT_MSG["char"]
	if ch == "v":
		if arg["vec"]:
			return null
		return PCT_MSG["vector"]
	if PCT_NUMERIC.contains(ch):
		if arg["num"]:
			return null
		return PCT_MSG["number"]
	return PCT_MSG["unsupported"]


const FUNC_ARG_SLOTS = {
	"int": ["int", "float", "bool"],
	"float": ["int", "float", "bool"],
	"bool": ["int", "float", "bool"],
	"String": ["String", "StringName"],
	"StringName": ["StringName", "String"],
	"Vector2": ["Vector2", "Vector2i"],
	"Vector2i": ["Vector2i", "Vector2"],
	"Vector3": ["Vector3", "Vector3i"],
	"Vector3i": ["Vector3i", "Vector3"],
	"Vector4": ["Vector4", "Vector4i"],
	"Vector4i": ["Vector4i", "Vector4"],
	"Color": ["Color", "String", "int"],
	"Rect2": [],
}


static func is_coll_text(name):
	if not (name.begins_with("Array[") or name.begins_with("Dictionary[")):
		return false
	if not name.ends_with("]"):
		return false
	var open = name.find("[")
	var inner = name.substr(open + 1, name.length() - open - 2)
	return inner.length() > 0 and not inner.contains("[")


static func scalar_source_name(st, class_names):
	return not is_coll_text(st) and st != "Variant" and st != "Array" and st != "Dictionary" and not class_names.has(st)


static func can_hold(kind, st):
	if kind == "int" or kind == "float":
		return st == "int" or st == "float" or st == "bool"
	if kind == "bool":
		return st == "bool" or st == "int" or st == "float"
	if kind == "String":
		return st == "String" or st == "StringName"
	if kind == "StringName" or kind == "Vector2" or kind == "Vector2i" or kind == "Vector3" or kind == "Vector3i" or kind == "Color":
		return value_slot_holds(kind, st)
	if kind == "Array":
		return st == "Array"
	if kind == "Dictionary":
		return st == "Dictionary"
	return true


static func dict_slot_of(name):
	var t = AS.parse_typed(name)
	if t != null and t.get("kind") == "Dictionary":
		return t
	if name == "Dictionary":
		return {"decl": name, "kind": "Dictionary"}
	return null


static func var_slot_holds(slot, st):
	if slot == "int":
		if st == "int" or st == "float" or st == "bool":
			return true
		if st == "String" or st == "StringName" or st == "null":
			return false
		return null
	if slot == "float":
		if st == "int" or st == "float":
			return true
		if st == "null" or st == "String" or st == "StringName":
			return false
		return null
	if slot == "bool":
		if st == "bool" or st == "int":
			return true
		if st == "null" or st == "String" or st == "StringName":
			return false
		return null
	if slot == "String":
		if st == "String" or st == "StringName":
			return true
		if st == "int" or st == "float" or st == "bool" or st == "null":
			return false
		return null
	if slot == "Vector2" or slot == "Vector2i" or slot == "Vector3" or slot == "Vector3i" or slot == "Color" or slot == "StringName":
		return value_slot_holds(slot, st)
	return null


static func value_slot_holds(slot, st):
	var widen = {
		"Vector2": ["Vector2", "Vector2i"],
		"Vector2i": ["Vector2i", "Vector2"],
		"Vector3": ["Vector3", "Vector3i"],
		"Vector3i": ["Vector3i", "Vector3"],
		"Vector4": ["Vector4", "Vector4i"],
		"Vector4i": ["Vector4i", "Vector4"],
		"Color": ["Color", "int", "String"],
		"StringName": ["StringName", "String"],
	}
	if not widen.has(slot):
		return false
	return widen[slot].has(st)


static func func_slot_name(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	var open = name.find("[")
	if open >= 0:
		name = name.substr(0, open)
	return name if FUNC_ARG_SLOTS.has(name) else null


static func literal_int_arg(e):
	if e.get("kind") == "lit" and e.get("lit") == "int":
		return int(e["value"])
	if e.get("kind") == "unary" and e.get("op") == "-":
		var inner = e["operand"]
		if inner.get("kind") == "lit" and inner.get("lit") == "int":
			return -int(inner["value"])
	return null


static func _star_digits(fmt, from, slots):
	var i = from
	while i < fmt.length() and (fmt[i] == "*" or (fmt[i] >= "0" and fmt[i] <= "9")):
		if fmt[i] == "*":
			slots.append({"kind": "star"})
		i += 1
	return i


static func pct_not_enough():
	return PCT_MSG["notEnough"]


static func pct_not_all():
	return PCT_MSG["notAll"]


static func pct_slots(fmt):
	var slots = []
	var i = 0
	while i < fmt.length():
		if fmt[i] != "%":
			i += 1
			continue
		i += 1
		if i >= fmt.length():
			slots.append({"kind": "tail"})
			break
		while i < fmt.length() and (fmt[i] == "-" or fmt[i] == "+" or fmt[i] == "0" or fmt[i] == "u"):
			i += 1
		if i < fmt.length() and fmt[i] == "%":
			i += 1
			continue
		i = _star_digits(fmt, i, slots)
		if i < fmt.length() and fmt[i] == ".":
			i = _star_digits(fmt, i + 1, slots)
		if i >= fmt.length():
			slots.append({"kind": "tail"})
			break
		slots.append({"kind": "conv", "ch": fmt[i]})
		i += 1
	return slots


static func fold_dict_key(e):
	if e["kind"] == "lit":
		var lit = e["lit"]
		if lit == "int":
			return {"t": "int", "v": int(e["value"])}
		if lit == "float":
			return {"t": "float", "v": float(e["value"])}
		if lit == "string" or lit == "string_name":
			return {"t": "str", "v": str(e["value"])}
		if lit == "node_path":
			return {"t": "np", "v": str(e["value"])}
		if lit == "bool":
			return {"t": "bool", "v": e["value"] == true}
		if lit == "null":
			return {"t": "null"}
		return null
	if e["kind"] == "unary" and e["op"] == "-":
		var k = fold_dict_key(e["operand"])
		if k == null:
			return null
		if k["t"] == "int":
			return {"t": "int", "v": -k["v"]}
		if k["t"] == "float":
			return {"t": "float", "v": -k["v"]}
		if k["t"] == "vec":
			var neg = []
			for x in k["xs"]:
				neg.append(-x)
			return {"t": "vec", "name": k["name"], "xs": neg}
		return null
	if e["kind"] == "binary":
		var a = fold_dict_key(e["left"])
		var b = fold_dict_key(e["right"])
		if a == null or b == null:
			return null
		return fold_dict_binary(e["op"], a, b)
	if e["kind"] == "call" and e["callee"]["kind"] == "ident" and (e["callee"]["name"] == "Vector2" or e["callee"]["name"] == "Vector3"):
		var n = 2 if e["callee"]["name"] == "Vector2" else 3
		if e["args"].size() != n:
			return null
		var xs = []
		for a in e["args"]:
			var k = fold_dict_key(a)
			if k == null:
				return null
			if k["t"] == "int":
				xs.append(float(k["v"]))
			elif k["t"] == "float":
				xs.append(k["v"])
			else:
				return null
		return {"t": "vec", "name": e["callee"]["name"], "xs": xs}
	if e["kind"] == "call" and e["callee"]["kind"] == "ident" and e["callee"]["name"] == "NodePath" and e["args"].size() == 1:
		var one = fold_dict_key(e["args"][0])
		if one != null and one["t"] == "str":
			return {"t": "np", "v": one["v"]}
	return null


static func fold_dict_binary(op, a, b):
	var an = _num_of(a)
	var bn = _num_of(b)
	if an == null or bn == null:
		return null
	if a["t"] == "int" and b["t"] == "int":
		if op == "+":
			return {"t": "int", "v": an + bn}
		if op == "-":
			return {"t": "int", "v": an - bn}
		if op == "*":
			return {"t": "int", "v": an * bn}
		if op == "/":
			return null if bn == 0 else {"t": "int", "v": int(an / bn)}
		if op == "%":
			return null if bn == 0 else {"t": "int", "v": an % bn}
		return null
	if op == "+":
		return {"t": "float", "v": float(an) + float(bn)}
	if op == "-":
		return {"t": "float", "v": float(an) - float(bn)}
	if op == "*":
		return {"t": "float", "v": float(an) * float(bn)}
	if op == "/":
		return {"t": "float", "v": float(an) / float(bn)}
	return null


static func _num_of(k):
	if k["t"] == "int" or k["t"] == "float":
		return k["v"]
	return null


static func instance_of_type_arg_message(e):
	var args = e["args"]
	if args.size() < 2:
		return null
	var first = args[0]
	var second = args[1]
	if first.get("kind") != "lit" or first.get("lit") != "int":
		return null
	var t = null
	if second.get("kind") == "lit" and second.get("lit") == "int":
		t = int(second["value"])
	elif second.get("kind") == "unary" and second.get("op") == "-" and second["operand"].get("kind") == "lit" and second["operand"].get("lit") == "int":
		t = -int(second["operand"]["value"])
	if t == null:
		return null
	if t >= 0 and t <= 38:
		return null
	return "Invalid argument for \"is_instance_of()\" function: Invalid type argument for is_instance_of(), use TYPE_* constants for built-in types."


static func slot_source(e):
	if e.get("kind") == "lit" and e.get("lit") == "string_name":
		return "StringName"
	return load("res://faces.gd").static_type(e)


const AT = preload("res://arity_tables.gd")
const PACK_APPEND_NAMED = {"bool": true, "float": true, "int": true, "String": true, "StringName": true, "NodePath": true, "Color": true, "Vector2": true, "Vector2i": true, "Vector3": true, "Vector3i": true, "Dictionary": true, "PackedByteArray": true, "PackedInt32Array": true, "PackedInt64Array": true, "PackedFloat32Array": true, "PackedFloat64Array": true, "PackedStringArray": true, "PackedVector2Array": true, "PackedVector3Array": true, "PackedVector4Array": true, "PackedColorArray": true, "Callable": true, "Object": true, "Node": true}


static func named_append_source(name, ann):
	if name == null:
		return null
	var t = ann.get(name)
	if t == null or not PACK_APPEND_NAMED.has(load("res://faces.gd").arg_face_base(t)):
		return null
	return load("res://literals.gd").typed_face_text(t) if t.contains("[") else t


static func named_slot_source(e, ann):
	if e.get("kind") != "ident" or e.get("name") == null:
		return null
	var t = ann.get(e["name"])
	if t == null or not load("res://faces.gd").arg_name_base_known(load("res://faces.gd").arg_face_base(t)):
		return null
	return load("res://literals.gd").typed_face_text(t) if t.contains("[") else t


static func pack_arg_source(e):
	if e.get("kind") == "binary" and e.get("op") == "+":
		if pack_arg_source(e["left"]) == "String" and pack_arg_source(e["right"]) == "String":
			return "String"
		return null
	if e.get("kind") == "lit":
		var lit = e.get("lit")
		if lit == "int":
			return "int"
		if lit == "float":
			return "float"
		if lit == "bool":
			return "bool"
		if lit == "string":
			return "String"
		if lit == "string_name":
			return "StringName"
		if lit == "node_path":
			return "NodePath"
		if lit == "null":
			return "null"
		return null
	if e.get("kind") == "array":
		return "Array"
	if e.get("kind") == "dict":
		return "Dictionary"
	if e.get("kind") == "call" and e["callee"].get("kind") == "ident":
		var name = e["callee"]["name"]
		if name == "Vector2" or name == "Vector3" or name == "Vector2i" or name == "Vector3i" or name == "Color" or AT.PACK_TYPE_NAMES.has(name):
			return name
	return null


static func pack_arg_scopes(m):
	var module_names = {}
	for v in m["vars"]:
		if v.get("type") != null and v["type"].get("kind") == "named":
			module_names[v["name"]] = v["type"]["name"]
	var out = []
	_collect_pack_scopes(m["funcs"], module_names, out)
	for c in m["innerClasses"]:
		var fields = module_names.duplicate()
		for v in c["vars"]:
			if v.get("type") != null and v["type"].get("kind") == "named":
				fields[v["name"]] = v["type"]["name"]
		_collect_pack_scopes(c["funcs"], fields, out)
		for inner in c["innerClasses"]:
			_collect_pack_class(inner, module_names, out)
	return out


static func _collect_pack_scopes(funcs, seed, out):
	for f in funcs:
		var base = seed.duplicate()
		for p in f["params"]:
			if p.get("type") != null and p["type"].get("kind") == "named":
				base[p["name"]] = p["type"]["name"]
		out.append({"nodes": load("res://walk.gd").flatten_body(f["body"]), "base": base})


static func _collect_pack_class(c, module_names, out):
	var fields = module_names.duplicate()
	for v in c["vars"]:
		if v.get("type") != null and v["type"].get("kind") == "named":
			fields[v["name"]] = v["type"]["name"]
	_collect_pack_scopes(c["funcs"], fields, out)
	for inner in c["innerClasses"]:
		_collect_pack_class(inner, module_names, out)


static func object_arg_known(x):
	return OBJECT_ARG_NAMES.has(x)


static func value_arg_wants(x):
	return VALUE_ARG_WANTS.has(x)


const GLOB = preload("res://globals.gd")


static func ctor_arg_name(a, arg_types):
	var lit = load("res://faces.gd").literal_type_name(a)
	if lit != null:
		return lit
	if a.get("kind") == "ident":
		var nm = a.get("name")
		if nm == null:
			return null
		if nm.begins_with("TYPE_") and GLOB.is_global_const(nm):
			return "Variant.Type"
		return arg_types.get(nm)
	return null


static func name_arg_bad(a, arg_ann, want):
	var nm = load("res://faces.gd").arg_name_type(a, arg_ann)
	if nm == null or nm == "int" or nm == "float" or nm == "bool" or nm == want:
		return null
	return nm


static func class_slot_names(m, globals):
	var out = {}
	_slot_class_names(m["innerClasses"], out)
	for g in globals.keys():
		out[g] = true
	return out


static func _slot_class_names(list, out):
	for c in list:
		out[c["name"]] = true
		_slot_class_names(c["innerClasses"], out)

static func _cfa_put(by_pos, pos, code, message):
	var bucket = by_pos.get(pos)
	if bucket == null:
		bucket = []
		by_pos[pos] = bucket
	for d in bucket:
		if d["message"] == message:
			return
	bucket.append({"code": code, "message": message})


static func _cfa_arg(got, pos):
	if got.size() < pos:
		return null
	return got[pos - 1]


static func _cfa_want_text(method, pos, want, bad):
	return "Invalid argument for \"" + method + "()\" function: argument " + str(pos) + " should be \"" + want + "\" but is \"" + bad + "\"."


static func class_face_arg_diags(e, face, method, arg_ann):
	var AR = load("res://arity.gd")
	var FC = load("res://faces.gd")
	var key = face + "." + method
	var by_pos = {}
	var got = []
	if e.get("kind") == "call":
		got = e["args"]
	for table in [O.FACE_ARG_AS.get(key), O.INSTANCE_ARG_AS.get(key)]:
		if table == null:
			continue
		for row in table:
			var pos = row[0]
			var refuse = row[1]
			var want = row[2]
			var also = row[3]
			var arg = _cfa_arg(got, pos)
			var bad = null
			if arg != null:
				bad = FC.literal_type_name(arg)
			if bad != null:
				var null_slot = bad == "null" and null_refused_by_value_slot(want)
				if not refuse.has(bad) and not null_slot:
					continue
				_cfa_put(by_pos, pos, "face-arg-pass", "Cannot pass a value of type \"" + bad + "\" as \"" + want + "\".")
				if null_slot or also.has(bad):
					_cfa_put(by_pos, pos, "face-arg-type", _cfa_want_text(method, pos, want, bad))
				continue
			var nm = null
			if arg != null:
				nm = FC.arg_name_type(arg, arg_ann)
			if nm == null:
				continue
			if not object_name_refused_by_value_slot(nm, want) and (not AR.face_list_has(refuse, nm) or not AR.face_list_has(also, nm)):
				continue
			_cfa_put(by_pos, pos, "face-arg-type", _cfa_want_text(method, pos, want, nm))
	for table2 in [O.FACE_ARG_TYPES.get(key), O.INSTANCE_ARG_TYPES.get(key)]:
		if table2 == null:
			continue
		for row2 in table2:
			var pos2 = row2[0]
			var refuse2 = row2[1]
			var want2 = row2[2]
			var arg2 = _cfa_arg(got, pos2)
			var bad2 = null
			if arg2 != null:
				bad2 = FC.literal_type_name(arg2)
			if bad2 != null:
				if not refuse2.has(bad2) and not (bad2 == "null" and null_refused_by_value_slot(want2)):
					continue
				_cfa_put(by_pos, pos2, "face-arg-type", _cfa_want_text(method, pos2, want2, bad2))
				continue
			var nm2 = null
			if arg2 != null:
				nm2 = FC.arg_name_type(arg2, arg_ann)
			if nm2 == null:
				continue
			if not object_name_refused_by_value_slot(nm2, want2) and not AR.face_list_has(refuse2, nm2):
				continue
			_cfa_put(by_pos, pos2, "face-arg-type", _cfa_want_text(method, pos2, want2, nm2))
	var out = []
	var positions = by_pos.keys()
	positions.sort()
	for pos3 in positions:
		for d in by_pos[pos3]:
			out.append(d)
	return out
