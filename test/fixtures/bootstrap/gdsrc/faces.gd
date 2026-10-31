const AS = preload("res://analyze_state.gd")
const SL = preload("res://slots.gd")
const LF = preload("res://literals.gd")

const ELEM_FACES = {"Vector2": true, "Vector2i": true, "Vector3": true, "Vector3i": true, "Vector4": true, "Vector4i": true, "Color": true, "String": true, "int": true, "float": true, "bool": true}
const PARAM_OWN_SLOTS = {"Array": true, "Dictionary": true, "NodePath": true, "Callable": true, "Signal": true, "Rect2": true, "Rect2i": true, "Transform2D": true, "Transform3D": true, "Plane": true, "Quaternion": true, "Basis": true, "AABB": true}
const STATIC_VALUE_TYPES = {"Vector2": true, "Vector3": true, "Vector2i": true, "Vector3i": true, "Vector4": true, "Vector4i": true, "Color": true}
const ARG_NAME_TYPES = {"int": true, "float": true, "bool": true, "String": true, "StringName": true, "NodePath": true, "Color": true, "Vector2": true, "Vector2i": true, "Vector3": true, "Vector3i": true, "Array": true, "Dictionary": true, "PackedByteArray": true, "PackedInt32Array": true, "PackedInt64Array": true, "PackedFloat32Array": true, "PackedFloat64Array": true, "PackedStringArray": true, "PackedVector2Array": true, "PackedVector3Array": true, "PackedVector4Array": true, "PackedColorArray": true, "Callable": true, "Object": true, "Node": true}


static func read_face_of(decl, key_type):
	var slot = AS.parse_typed(decl)
	if slot == null:
		return null
	if slot["kind"] == "Array":
		if key_type != null and key_type != "int":
			return null
		if slot.has("elem") and ELEM_FACES.has(slot["elem"]):
			return slot["elem"]
		return null
	if not slot.has("key") or not slot.has("val") or not ELEM_FACES.has(slot["val"]):
		return null
	if key_type != null and not SL.can_hold(slot["key"], key_type):
		return null
	return slot["val"]


static func holds_param_default(slot, st):
	if slot == st:
		return true
	if slot == "int" or slot == "float" or slot == "bool":
		return st == "int" or st == "float" or st == "bool"
	if slot == "String":
		return st == "String" or st == "StringName" or st == "NodePath"
	if slot == "StringName":
		return st == "String" or st == "StringName"
	if slot == "NodePath":
		return st == "String" or st == "NodePath"
	if PARAM_OWN_SLOTS.has(slot):
		return false
	if st == "Array" or st == "Dictionary" or st == "NodePath":
		return false
	return SL.var_slot_holds(slot, st) == true


static func scalar_static_name(name):
	if name.begins_with("Array["):
		return "Array"
	if name.begins_with("Dictionary["):
		return "Dictionary"
	if name in ["int", "float", "bool", "String", "StringName", "Vector2", "Vector3", "Vector2i", "Vector3i", "Color"]:
		return name
	return null


static func string_name_vars(node, out):
	if node is Array:
		for x in node:
			string_name_vars(x, out)
		return
	if not (node is Dictionary):
		return
	if node.get("kind") == "var":
		var type = node.get("type")
		if type != null and type.get("kind") == "named" and type.get("name") == "StringName" and node.get("name") != null:
			out[node["name"]] = true
	for k in node.keys():
		if k == "loc":
			continue
		string_name_vars(node[k], out)


static func static_type_name(e):
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
		return null
	if e.get("kind") == "array":
		return "Array"
	if e.get("kind") == "dict":
		return "Dictionary"
	if e.get("kind") == "call" and e["callee"].get("kind") == "ident" and STATIC_VALUE_TYPES.has(e["callee"]["name"]):
		return e["callee"]["name"]
	return null


static func arg_face_base(t):
	var open = t.find("[")
	if open < 0:
		return t
	return t.substr(0, open)


static func arg_name_of(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	if name.contains("[") and not name.contains("]"):
		return null
	var text = LF.typed_face_text(name) if name.contains("[") else name
	return text if ARG_NAME_TYPES.has(arg_face_base(text)) else null


const G = preload("res://globals.gd")
const PACK_TYPE_NAMES = {"PackedByteArray": true, "PackedInt32Array": true, "PackedInt64Array": true, "PackedFloat32Array": true, "PackedFloat64Array": true, "PackedStringArray": true, "PackedVector2Array": true, "PackedVector3Array": true, "PackedVector4Array": true, "PackedColorArray": true}


static func value_type_annotation(t):
	if t != null and t.get("kind") == "named" and G.VALUE_CTOR_NAMES.has(t["name"]):
		return t["name"]
	return null


static func literal_face_type(e, face_typed):
	if e.get("kind") == "lit":
		if e.get("lit") == "string":
			return "String"
		return null
	if e.get("kind") == "array":
		return "Array"
	if e.get("kind") == "dict":
		return "Dictionary"
	if e.get("kind") == "ident":
		return face_typed.get(e["name"])
	return null


static func literal_type_name(e):
	if e == null:
		return null
	if e.get("kind") == "lit":
		var lit = e.get("lit")
		if lit == "int":
			return "int"
		if lit == "float":
			return "float"
		if lit == "bool":
			return "bool"
		if lit == "null":
			return "null"
		if lit == "string":
			return "String"
		if lit == "string_name":
			return "StringName"
		if lit == "node_path":
			return "NodePath"
		return null
	if e.get("kind") == "array":
		return "Array"
	if e.get("kind") == "dict":
		return "Dictionary"
	if e.get("kind") == "lambda":
		return "Callable"
	if e.get("kind") == "call" and e["callee"].get("kind") == "ident":
		var name = e["callee"]["name"]
		if G.NUMERIC_VALUE_CTORS.has(name) or PACK_TYPE_NAMES.has(name):
			return name
	return null


static func chain_face_known(face):
	return G.VALUE_CTOR_NAMES.has(face) or face == "String" or face == "StringName" or face == "NodePath"


static func known_face_annotation(t):
	if t == null or t.get("kind") != "named":
		return null
	var name = t["name"]
	var open = name.find("[")
	var base = name if open < 0 else name.substr(0, open)
	if base in ["String", "StringName", "NodePath", "Array", "Dictionary"]:
		return base
	if PACK_TYPE_NAMES.has(base) or G.VALUE_CTOR_NAMES.has(base):
		return base
	return null


static func pack_face_recv(obj, ann):
	if obj == null:
		return null
	if obj.get("kind") == "ident" and obj.get("name") != null:
		return ann.get(obj["name"])
	if obj.get("kind") == "call":
		var inner = obj.get("callee")
		var cn = null
		if inner != null and inner.get("kind") == "ident":
			cn = inner["name"]
		if cn != null and PACK_TYPE_NAMES.has(cn):
			return cn
	return null


static func static_type(e):
	var kind = e.get("kind")
	if kind == "lit":
		var lit = e.get("lit")
		if lit == "int":
			return "int"
		if lit == "float":
			return "float"
		if lit == "string" or lit == "string_name":
			return "String"
		if lit == "node_path":
			return null
		if lit == "bool":
			return "bool"
		return "null"
	if kind == "array":
		return "Array"
	if kind == "dict":
		return "Dictionary"
	if kind == "unary":
		var t = static_type(e["operand"])
		if e.get("op") == "not":
			return "bool"
		if e.get("op") == "-" and (t == "int" or t == "float"):
			return t
		return null
	if kind == "binary":
		var l = static_type(e["left"])
		var r = static_type(e["right"])
		if e.get("op") == "+" and (l == "String" or r == "String"):
			return "String"
		if e.get("op") == "+" and (l == "Array" or r == "Array"):
			return "Array"
		if l == "int" and r == "int":
			return "int"
		if _is_num(l) and _is_num(r):
			return "float"
		return null
	if kind == "call":
		if e["callee"].get("kind") == "ident" and STATIC_VALUE_TYPES.has(e["callee"]["name"]):
			return e["callee"]["name"]
		return null
	return null


static func _is_num(t):
	return t == "int" or t == "float"


static func static_value_type(name):
	return STATIC_VALUE_TYPES.has(name)


const T = preload("res://arity_tables.gd")


static func _arity_mgr(face):
	return load("res://arity.gd").instance_face_managed(face)


static func attr_face_recv(obj, ann, elems, mods):
	if obj == null:
		return null
	var kind = obj.get("kind")
	if kind == "index":
		var base = obj.get("obj")
		if base == null or base.get("kind") != "ident" or base.get("name") == null:
			return null
		return read_face_of(elems.get(base["name"], ""), static_type(obj["index"]))
	if kind == "ident" and obj.get("name") != null:
		var face = ann.get(obj["name"])
		if face == null:
			face = mods.get(obj["name"])
		if face == null:
			return null
		return null if face == "Dictionary" else face
	if kind == "array":
		return "Array"
	if kind == "lit" and obj.get("lit") == "string":
		return "String"
	if kind == "call":
		var inner = obj.get("callee")
		var cn = inner["name"] if inner != null and inner.get("kind") == "ident" else null
		if cn != null and (cn == "Array" or cn == "String" or cn == "StringName" or cn == "NodePath" or T.VALUE_ARITY.has(cn)):
			return cn
		if inner != null and inner.get("kind") == "attribute":
			var owner = attr_face_recv(inner["obj"], ann, elems, mods)
			var mname = inner.get("name")
			if owner != null and mname != null:
				var by = T.BUILTIN_METHOD_RETURNS.get(owner)
				var ret = by.get(mname) if by != null else null
				if ret != null and (_arity_mgr(ret) or chain_face_known(ret)):
					return ret
	if kind == "attribute":
		var owner2 = attr_face_recv(obj.get("obj"), ann, elems, mods)
		var nm = obj.get("name")
		if owner2 != null and nm != null:
			var by2 = T.BUILTIN_MEMBER_TYPES.get(owner2)
			var t2 = by2.get(nm) if by2 != null else null
			if t2 != null and (_arity_mgr(t2) or t2 == "String"):
				return t2
		return null
	if kind == "lit" and (obj.get("lit") == "string_name" or obj.get("lit") == "node_path"):
		return "StringName" if obj.get("lit") == "string_name" else "NodePath"
	return pack_face_recv(obj, ann)


static func chain_recv_face(e, owner):
	if e.get("kind") != "call" or e["callee"].get("kind") != "attribute":
		return null
	if owner == null:
		return null
	var by = T.BUILTIN_METHOD_RETURNS.get(owner)
	if by == null:
		return null
	var name = e["callee"].get("name")
	if name == null:
		return null
	var ret2 = by.get(name)
	if ret2 != null and chain_face_known(ret2):
		return ret2
	return null


static func static_face_const_name(t, name):
	if not T.STATIC_FACE.has(t):
		return false
	var face = T.STATIC_FACE[t]
	if face["consts"].has(name) or face["axis"].has(name):
		return true
	return t == "Color" and T.COLOR_NAMED.has(name.to_lower())


static func arg_name_type(e, ann):
	if e == null or e.get("kind") != "ident" or e.get("name") == null:
		return null
	return ann.get(e["name"])


static func arg_name_scopes(m):
	var out = []
	var module_names = {}
	for v in m["vars"]:
		var t = arg_name_of(v.get("type"))
		if t != null:
			module_names[v["name"]] = t
	_collect_name_scopes(m["funcs"], module_names, out)
	for c in m["innerClasses"]:
		_collect_class_name_scopes(c, out)
	return out


static func _collect_name_scopes(funcs, fields, out):
	for f in funcs:
		var ann = fields.duplicate()
		for p in f["params"]:
			var t = arg_name_of(p.get("type"))
			if t != null:
				ann[p["name"]] = t
		for n in load("res://walk.gd").flatten_body(f["body"]):
			if n.get("kind") != "var" or n.get("name") == null:
				continue
			var t2 = arg_name_of(n.get("type"))
			if t2 != null:
				ann[n["name"]] = t2
		out.append({"body": f["body"], "ann": ann})


static func _collect_class_name_scopes(c, out):
	var fields = {}
	for v in c["vars"]:
		var t = arg_name_of(v.get("type"))
		if t != null:
			fields[v["name"]] = t
	_collect_name_scopes(c["funcs"], fields, out)
	for inner in c["innerClasses"]:
		_collect_class_name_scopes(inner, out)


static func _named_type(t, type):
	if t == null or t.get("kind") != "named":
		return false
	var name = t["name"]
	var open = name.find("[")
	var base = name if open < 0 else name.substr(0, open)
	return base == type


static func init_matches(init, init_kind):
	if init == null:
		return false
	if init_kind == "string_lit":
		return init.get("kind") == "lit" and init.get("lit") == "string"
	if init_kind == "string_name_lit_or_ctor":
		if init.get("kind") == "lit" and init.get("lit") == "string_name":
			return true
		return ctor_recv_face(init, {"type": "StringName"})
	if init_kind == "node_path_lit_or_ctor":
		if init.get("kind") == "lit" and init.get("lit") == "node_path":
			return true
		return ctor_recv_face(init, {"type": "NodePath", "ctorRecv": true})
	return init.get("kind") == init_kind


static func face_receiver_names(nodes, seeded, assigned, type, init_kind, annot_only = false, texts = null):
	var out = {}
	for name in seeded.keys():
		if seeded[name] == "annot":
			out[name] = true
		elif not annot_only and not assigned.has(name):
			out[name] = true
	var reassigned = load("res://walk.gd").reassigned_names(nodes)
	for n in nodes:
		if n.get("kind") != "var" or n.get("name") == null:
			continue
		if reassigned.has(n["name"]):
			out.erase(n["name"])
			continue
		if _named_type(n.get("type"), type):
			out[n["name"]] = true
			if texts != null and n.get("type") != null:
				texts[n["name"]] = n["type"]["name"]
			continue
		var init = n.get("init")
		if not annot_only and n.get("type") == null and init_matches(init, init_kind):
			out[n["name"]] = true
		elif not init_matches(init, init_kind) or annot_only:
			if annot_only and _named_type(n.get("type"), type):
				continue
			out.erase(n["name"])
	return out


static func face_scopes(m, type, init_kind):
	var module_names = {}
	var module_texts = {}
	for v in m["vars"]:
		if _named_type(v.get("type"), type):
			module_names[v["name"]] = "annot"
			if v.get("type") != null:
				module_texts[v["name"]] = v["type"]["name"]
		elif v.get("type") == null and init_matches(v.get("init"), init_kind):
			module_names[v["name"]] = "inferred"
	var out = []
	_collect_scopes(m["funcs"], module_names, module_texts, type, init_kind, out)
	for c in m["innerClasses"]:
		_collect_class_scopes(c, type, init_kind, out)
	return out


static func _collect_scopes(funcs, base, base_texts, type, init_kind, out):
	for f in funcs:
		var seeded = base.duplicate()
		var texts = base_texts.duplicate()
		for p in f["params"]:
			if _named_type(p.get("type"), type):
				seeded[p["name"]] = "annot"
				if p.get("type") != null:
					texts[p["name"]] = p["type"]["name"]
		out.append({"nodes": load("res://walk.gd").flatten_body(f["body"]), "seeded": seeded, "body": f["body"], "texts": texts})


static func _collect_class_scopes(c, type, init_kind, out):
	var fields = {}
	var field_texts = {}
	for v in c["vars"]:
		if _named_type(v.get("type"), type):
			fields[v["name"]] = "annot"
			if v.get("type") != null:
				field_texts[v["name"]] = v["type"]["name"]
		elif v.get("type") == null and v.get("init") != null and init_matches(v.get("init"), init_kind):
			fields[v["name"]] = "inferred"
	_collect_scopes(c["funcs"], fields, field_texts, type, init_kind, out)
	for inner in c["innerClasses"]:
		_collect_class_scopes(inner, type, init_kind, out)


static func arg_name_base_known(base):
	return ARG_NAME_TYPES.has(base)


static func attr_scopes(m):
	var out = []
	for f in m["funcs"]:
		out.append({"nodes": load("res://walk.gd").flatten_body(f["body"]), "params": f["params"]})
	_collect_attr_scopes(m["innerClasses"], out)
	return out


static func _collect_attr_scopes(list, out):
	for c in list:
		for f in c["funcs"]:
			out.append({"nodes": load("res://walk.gd").flatten_body(f["body"]), "params": f["params"]})
		_collect_attr_scopes(c["innerClasses"], out)


static func is_param_own_slot(base):
	return PARAM_OWN_SLOTS.has(base)

static func ctor_recv_face(e, face):
	if face.get("ctorRecv") != true or e.get("kind") != "call":
		return false
	var callee = e.get("callee")
	if callee == null or callee.get("kind") != "ident" or callee.get("name") != face["type"]:
		return false
	var args = e.get("args")
	if args == null or args.size() != 1:
		return false
	var first = args[0]
	return first.get("kind") == "lit" and first.get("lit") == "string"


static func lambda_capture_names(e):
	if e.get("kind") != "lambda" or e.get("loc") == null:
		return []
	var r = AS.get_run()
	var caps = r["lambdaCaptures"].get(AS.cap_key(r, e["loc"]["line"], e["loc"]["col"]))
	if caps == null:
		return []
	return caps
