const T = preload("res://arity_tables.gd")
const FC = preload("res://faces.gd")
const G = preload("res://globals.gd")
const O = preload("res://op_tables.gd")


static func class_face_arity(t):
	if t == "Array":
		return T.ARRAY_ARITY
	if t == "String":
		return T.STRING_ARITY
	if t == "StringName":
		return T.STRING_NAME_ARITY
	if t == "NodePath":
		return T.NODE_PATH_ARITY
	if t == "Dictionary":
		return T.DICT_ARITY
	return null


static func face_list_has(list, t):
	return list.has(t) or (t.contains("[") and list.has(FC.arg_face_base(t)))


static func arity_diag(table, code, method, got, loc):
	if not table.has(method):
		return null
	var sig = table[method]
	if got >= sig[0] and got <= sig[1]:
		return null
	if got < sig[0]:
		return {"code": code, "message": "Too few arguments for \"" + method + "()\" call. Expected at least " + str(sig[0]) + " but received " + str(got) + ".", "loc": loc}
	return {"code": code, "message": "Too many arguments for \"" + method + "()\" call. Expected at most " + str(sig[1]) + " but received " + str(got) + ".", "loc": loc}


static func member_name_absent(face, name):
	if not T.BUILTIN_INSTANCE_MEMBERS.has(face):
		return false
	return not T.BUILTIN_INSTANCE_MEMBERS[face].has(name)


static func chain_arity_face(face):
	if face == "String":
		return {"table": T.STRING_ARITY, "code": "string-arity"}
	if face == "StringName":
		return {"table": T.STRING_NAME_ARITY, "code": "string-name-arity"}
	if face == "NodePath":
		return {"table": T.NODE_PATH_ARITY, "code": "node-path-arity"}
	return {"table": T.VALUE_ARITY.get(face, {}), "code": "value-arity"}


static func instance_face_managed(face):
	if face == "Array" or face == "Dictionary" or face == "StringName" or face == "NodePath" or T.PACK_TYPE_NAMES.has(face):
		return false
	return T.BUILTIN_INSTANCE_MEMBERS.has(face)


static func instance_member_absent(face, name):
	if not instance_face_managed(face) and face != "String":
		return false
	if not T.BUILTIN_INSTANCE_MEMBERS.has(face):
		return false
	return not T.BUILTIN_INSTANCE_MEMBERS[face].has(name)


static func builtin_instance_absent(face, name):
	if not T.BUILTIN_INSTANCE_MEMBERS.has(face):
		return false
	return not T.BUILTIN_INSTANCE_MEMBERS[face].has(name)


static func face_ctor_literal(e):
	if e.get("kind") != "call" or e["callee"].get("kind") != "ident":
		return null
	var name = e["callee"]["name"]
	if not T.FACE_CTOR_LITERAL.has(name):
		return null
	var args = e.get("args", [])
	if args.size() != 1:
		return null
	var a = args[0]
	if a.get("kind") == "lit" and a.get("lit") == "string":
		return T.FACE_CTOR_LITERAL[name]
	return null


static func builtin_arity(name, got):
	if not T.BUILTIN_ARITY.has(name):
		return null
	var ar = T.BUILTIN_ARITY[name]
	if got >= ar[0] and got <= ar[1]:
		return null
	if got < ar[0]:
		return "Too few arguments for \"" + name + "()\" call. Expected at least " + str(ar[0]) + " but received " + str(got) + "."
	return "Too many arguments for \"" + name + "()\" call. Expected at most " + str(ar[1]) + " but received " + str(got) + "."


static func utility_arity(name, got):
	if not T.UTILITY_ARITY.has(name):
		return null
	var u = T.UTILITY_ARITY[name]
	var mn = u[0]
	var mx = u[1]
	var kind = u[2]
	if got >= mn and (mx == null or got <= mx):
		return null
	var shown = mn
	if mx != null and got > mx:
		shown = mx
	return "Invalid call to " + kind + " \"" + name + "()\". Expected " + str(shown) + " argument(s)."


static func builtin_arity_code(name):
	if name == "char":
		return "char-arity"
	if name == "var_to_str":
		return "var-to-str-arity"
	if name == "str_to_var":
		return "str-to-var-arity"
	if name == "convert" or name == "type_convert":
		return "convert-arity"
	if name == "range" or name == "str":
		return name + "-arity"
	return "builtin-arity"


static func value_ctor_type(e):
	if e != null and e.get("kind") == "call" and e["callee"].get("kind") == "ident" and G.VALUE_CTOR_NAMES.has(e["callee"]["name"]):
		return e["callee"]["name"]
	return null


static func array_arity():
	return T.ARRAY_ARITY


static func static_call_diags(t, name, got):
	var face = T.STATIC_FACE.get(t)
	var extra = class_face_arity(t)
	if face == null and not T.PACK_TYPE_NAMES.has(t) and extra == null:
		return []
	if face != null and FC.static_face_const_name(t, name):
		var shown = t + ".Axis" if face["axis"].has(name) else t
		return [{"code": "static-const-call", "message": "Name \"" + name + "\" called as a function but is a \"" + shown + "\"."}]
	var sig = face["statics"].get(name) if face != null else null
	if sig != null:
		if got >= sig[0] and got <= sig[1]:
			return []
		if got < sig[0]:
			return [{"code": "static-arity", "message": "Too few arguments for \"" + name + "()\" call. Expected at least " + str(sig[0]) + " but received " + str(got) + "."}]
		return [{"code": "static-arity", "message": "Too many arguments for \"" + name + "()\" call. Expected at most " + str(sig[1]) + " but received " + str(got) + "."}]
	var vm = T.VALUE_ARITY.get(t)
	if vm != null and vm.has(name):
		return [{"code": "static-nonstatic-call", "message": "Cannot call non-static function \"" + name + "()\" on the class \"" + t + "\" directly. Make an instance instead."}]
	if extra != null and extra.has(name):
		return [{"code": "static-nonstatic-call", "message": "Cannot call non-static function \"" + name + "()\" on the class \"" + t + "\" directly. Make an instance instead."}]
	return [
		{"code": "static-member-unknown", "message": "Cannot find member \"" + name + "\" in base \"" + t + "\"."},
		{"code": "static-member-unknown", "message": "Function \"" + name + "()\" not found in base " + t + "."},
	]


static func static_bare_diags(t, name):
	if name == "new" and T.BUILTIN_NEW_ABSENT_FACES.has(t):
		var one = "Cannot find member \"new\" in base \"" + t + "\"."
		return [{"code": "static-member-unknown", "message": one}, {"code": "static-member-unknown", "message": one}]
	var face = T.STATIC_FACE.get(t)
	if face == null or not face["statics"].has(name) or FC.static_face_const_name(t, name):
		return []
	var one2 = "Cannot find member \"" + name + "\" in base \"" + t + "\"."
	return [{"code": "static-member-unknown", "message": one2}, {"code": "static-member-unknown", "message": one2}]

static func _is_literal_obj(obj, lit_kind, extra):
	if lit_kind == "array":
		return obj.get("kind") == "array"
	if lit_kind == "dict":
		return obj.get("kind") == "dict"
	if lit_kind == "string" or lit_kind == "string_lit":
		return obj.get("kind") == "lit" and obj.get("lit") == "string"
	if lit_kind == "string_name_lit_or_ctor":
		if obj.get("kind") == "lit" and obj.get("lit") == "string_name":
			return true
		return FC.ctor_recv_face(obj, {"type": "StringName"})
	if lit_kind == "node_path_lit_or_ctor":
		if obj.get("kind") == "lit" and obj.get("lit") == "node_path":
			return true
		return FC.ctor_recv_face(obj, {"type": "NodePath", "ctorRecv": true})
	if lit_kind == "string_lit_or_read":
		if obj.get("kind") == "lit" and obj.get("lit") == "string":
			return true
		if obj.get("kind") == "index" and obj["obj"].get("kind") == "ident":
			var base = obj["obj"]["name"]
			var decl = extra["reads"].get(base)
			if decl == null:
				return false
			return FC.read_face_of(decl, FC.static_type(obj["index"])) == "String"
		return false
	return false


static func container_call_arity(n, table, code, names, lit_kind, extra = null):
	if n.get("kind") != "call":
		return null
	var callee = n.get("callee")
	if callee == null or callee.get("kind") != "attribute":
		return null
	var obj = callee.get("obj")
	if obj == null:
		return null
	var proven = _is_literal_obj(obj, lit_kind, extra)
	if not proven and obj.get("kind") == "ident" and obj.get("name") != null:
		proven = names.has(obj["name"])
	if not proven:
		return null
	var method = callee.get("name")
	if method == null:
		return null
	var args = n.get("args")
	var got = args.size() if args != null else 0
	return arity_diag(table, code, method, got, n.get("loc"))


static func face_ghost_diags(n, table, face_type, two_sentences, names, lit_kind, texts = null, extra = null):
	if n.get("kind") != "call":
		return []
	var callee = n.get("callee")
	if callee == null or callee.get("kind") != "attribute":
		return []
	var obj = callee.get("obj")
	if obj == null:
		return []
	var proven = _is_literal_obj(obj, lit_kind, extra)
	if not proven and obj.get("kind") == "ident" and obj.get("name") != null:
		proven = names.has(obj["name"])
	if not proven:
		return []
	var method = callee.get("name")
	if method == null or table.has(method):
		return []
	var shown = face_type
	if obj.get("kind") == "ident" and obj.get("name") != null and texts != null:
		var t = texts.get(obj["name"])
		if t != null:
			shown = t
	var out = []
	if two_sentences:
		out.append({"code": "face-member-missing", "message": "Cannot find member \"" + method + "\" in base \"" + shown + "\".", "loc": n.get("loc")})
	out.append({"code": "face-member-not-found", "message": "Function \"" + method + "()\" not found in base " + shown + ".", "loc": n.get("loc")})
	return out


static func value_attr_kind(face, name):
	var ex = O.VALUE_EXIST.get(face)
	if ex == null:
		return null
	if not O.VALUE_ATTR_UNIVERSE.has(name):
		return null
	if not ex.has(name):
		return "absent"
	var by = T.VALUE_ARITY.get(face)
	var sig = null if by == null else by.get(name)
	return "prop" if sig == null else "member"
