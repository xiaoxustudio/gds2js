const CTX = preload("res://context.gd")
const GLOB = preload("res://globals.gd")
const NATIVE_CLASS_SLOTS = {"Object": true, "RefCounted": true, "Node": true}


static func is_elem_kind(name):
	return name in ["int", "float", "bool", "String", "StringName", "Vector2", "Vector3", "Vector4", "Vector4i", "Vector2i", "Vector3i", "Color", "Array", "Dictionary"]


static func unwrap_self_member(t):
	if t.get("kind") != "attribute" or t["obj"].get("kind") != "ident" or t["obj"].get("name") != "self":
		return null
	if not CTX.ctx["CURRENT_MEMBERS"].has(t["name"]) and not CTX.ctx["MODULE_VARS"].has(t["name"]):
		return null
	return {"kind": "ident", "name": t["name"], "loc": t["loc"]}


static func container_ann_text(ann):
	if ann == null or ann.get("kind") != "named":
		return null
	var name = ann["name"]
	var base = ""
	if name.begins_with("Array["):
		base = "Array"
	elif name.begins_with("Dictionary["):
		base = "Dictionary"
	else:
		return null
	if not name.ends_with("]"):
		return null
	var inner = name.substr(base.length() + 1, name.length() - base.length() - 2)
	if inner == "" or inner.contains("["):
		return null
	var parts = []
	for p in inner.split(","):
		parts.append(p.strip_edges())
	if base == "Array":
		if parts.size() != 1:
			return null
		var one = parts[0]
		if is_elem_kind(one) or NATIVE_CLASS_SLOTS.has(one) or CTX.ctx["SCRIPT_BASE"].has(one):
			return "Array[" + one + "]"
		return null
	if parts.size() != 2 or not is_elem_kind(parts[0]) or not is_elem_kind(parts[1]):
		return null
	return "Dictionary[" + parts[0] + ", " + parts[1] + "]"


static func range_arg_list(a):
	var parts = []
	for x in a:
		if x != null:
			parts.append(x)
	return "[" + ", ".join(parts) + "]"


static func is_range_call(e):
	if e["kind"] != "call":
		return false
	if e["callee"]["kind"] != "ident" or e["callee"]["name"] != "range":
		return false
	return e["args"].size() >= 1 and e["args"].size() <= 3


static func basename_of_gd(path):
	if path == null or path == "":
		return null
	var cut = max(path.rfind("/"), path.rfind("\\"))
	return path.substr(cut + 1)


static func has_value_return(stmts):
	for s in stmts:
		if s["kind"] == "return" and s["value"] != null:
			return true
		if s["kind"] == "if":
			for br in s["branches"]:
				if has_value_return(br["body"]):
					return true
		if s["kind"] == "for" or s["kind"] == "while":
			if has_value_return(s["body"]):
				return true
		if s["kind"] == "match":
			for arm in s["arms"]:
				if has_value_return(arm["body"]):
					return true
	return false


static func type_default(t):
	if t == null:
		return "rt.V.nil()"
	if t["kind"] == "array":
		return "rt.V.array(rt.GArray.of([]))"
	if t["kind"] != "named":
		return "rt.V.nil()"
	var base = t["name"]
	var open = base.find("[")
	if open >= 0:
		base = base.substr(0, open)
	if base == "int":
		return "rt.V.int(0)"
	if base == "float":
		return "rt.V.float(0)"
	if base == "bool":
		return "rt.V.bool(false)"
	if base == "String":
		return "rt.V.str(\"\")"
	if base == "StringName":
		return "rt.V.stringName(\"\")"
	if base == "Array":
		return "rt.V.array(rt.GArray.of([]))"
	if base == "Dictionary":
		return "rt.dictOf([])"
	if base == "Vector2":
		return "rt.vector2(0, 0)"
	if base == "Vector3":
		return "rt.vector3(0, 0, 0)"
	if base == "Vector2i":
		return "rt.vector2i(0, 0)"
	if base == "Vector3i":
		return "rt.vector3i(0, 0, 0)"
	if base == "Vector4":
		return "rt.vector4(0, 0, 0, 0)"
	if base == "Vector4i":
		return "rt.vector4i(0, 0, 0, 0)"
	if base == "Transform2D":
		return "rt.transform2d(1, 0, 0, 1, 0, 0)"
	if base == "Transform3D":
		return "rt.transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0)"
	if base == "Quaternion":
		return "rt.quaternion(0, 0, 0, 1)"
	if base == "Plane":
		return "rt.plane(0, 0, 0, 0)"
	if base == "AABB":
		return "rt.aabb(0, 0, 0, 0, 0, 0)"
	if base == "Rect2":
		return "rt.rect2(0, 0, 0, 0)"
	if base == "Rect2i":
		return "rt.rect2i(0, 0, 0, 0)"
	if base == "Basis":
		return "rt.basis(1, 0, 0, 0, 1, 0, 0, 0, 1)"
	if base == "Color":
		return "rt.color(0, 0, 0, 1)"
	if base == "PackedByteArray":
		return "rt.bytesCtor([])"
	if base == "PackedInt32Array":
		return "rt.packCtor(\"int32\", [])"
	if base == "PackedInt64Array":
		return "rt.packCtor(\"int64\", [])"
	if base == "PackedFloat32Array":
		return "rt.packCtor(\"float32\", [])"
	if base == "PackedFloat64Array":
		return "rt.packCtor(\"float64\", [])"
	if base == "PackedStringArray":
		return "rt.packCtor(\"string\", [])"
	if base == "PackedVector2Array":
		return "rt.packCtor(\"vector2\", [])"
	if base == "PackedVector3Array":
		return "rt.packCtor(\"vector3\", [])"
	if base == "PackedVector4Array":
		return "rt.packCtor(\"vector4\", [])"
	if base == "PackedColorArray":
		return "rt.packCtor(\"color\", [])"
	return "rt.V.nil()"


static func type_name(t):
	if t["kind"] == "named":
		return t["name"]
	if t["kind"] == "array":
		return "Array"
	return "Variant"


const HOST_PRINT_NAMES = ["print", "printJoined", "printRaw", "printErr", "printVerbose", "printRich", "printDebug"]


static func standalone_inline_header(body):
	var lines = body.split("\n")
	var indented = []
	for l in lines:
		indented.append("  " + l if l.length() > 0 else l)
	var out = [
		"import { createRequire } from \"node:module\";",
		"const { rt, " + ", ".join(HOST_PRINT_NAMES) + ", SceneTree } = (() => {",
		"  const require = createRequire(import.meta.url);",
		"  const module = { exports: {} };",
		"  const exports = module.exports;",
		"\n".join(indented),
		"  return exports;",
		"})();",
	]
	return "\n".join(out)


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


static func _leaf_of(k):
	if k == "int[]":
		return "int"
	if k == "float[]":
		return "float"
	if k == "str[]":
		return "str"
	return k


static func fast_suffix(k):
	return "Str" if _leaf_of(k) == "str" else "Num"


static func make_closure(cls, init, proto_shape):
	if proto_shape:
		return "(a) => new " + cls + "(...a)"
	if init == null or init["params"].is_empty():
		return "() => new " + cls + "()"
	var fwd = load("res://layout.gd").fwd_params(init["params"], "a")
	return "(a) => new " + cls + "(" + fwd + ")"


static func maps_equal(a, b):
	if a.size() != b.size():
		return false
	for k in a.keys():
		if not b.has(k):
			return false
		if a[k] != b[k]:
			return false
	return true


static func frame_enter_lines(name):
	return [
		"  const __gd_frame = rt.frameEnter(" + JSON.stringify(CTX.ctx["DEBUG_FILE"]) + ", " + JSON.stringify(name) + ");",
		"  try {",
	]


static func frame_exit_lines(catch_ret):
	if catch_ret == null:
		return ["  } finally {", "    rt.frameExit(__gd_frame);", "  }"]
	return [
		"  } catch (__gd_err) {",
		"    rt.gdFunctionError(__gd_err);",
		"    " + catch_ret,
		"  } finally {",
		"    rt.frameExit(__gd_frame);",
		"  }",
	]


static func callable_in_scope(name):
	return CTX.ctx["MODULE_FUNCS"].has(name) or CTX.ctx["CLASS_FUNCS"].has(name) or CTX.ctx["STATIC_FUNCS"].has(name) or CTX.ctx["CURRENT_MEMBERS"].has(name) or CTX.ctx["MODULE_VARS"].has(name) or CTX.ctx["INHERITED_METHODS"].has(name) or CTX.ctx["CLASS_VALUE_OWNERS"].has(name)


static func _slot_elem_kind_name(name):
	if is_elem_kind(name):
		return name
	return "Object" if CTX.ctx["SCRIPT_BASE"].has(name) else null


static func stamp_decl(t, raw, has_init, from_literal):
	var out = raw
	if not has_init:
		out = type_default(t)
	if t == null or t.get("kind") != "named":
		return out
	var name = t["name"]
	var base = ""
	if name.begins_with("Array["):
		base = "Array"
	elif name.begins_with("Dictionary["):
		base = "Dictionary"
	else:
		return out
	if not name.ends_with("]"):
		return out
	var inner = name.substr(base.length() + 1, name.length() - base.length() - 2)
	if inner.contains("["):
		return out
	if base == "Array":
		var kind = inner.strip_edges()
		if NATIVE_CLASS_SLOTS.has(kind):
			return "rt.stampClassArray(" + out + ", " + JSON.stringify(kind) + ", " + str(from_literal) + ")"
		if CTX.ctx["SCRIPT_BASE"].has(kind):
			return "rt.stampScriptArray(" + out + ", " + JSON.stringify(kind) + ", " + JSON.stringify(CTX.ctx["SCRIPT_BASE"][kind]) + ", " + str(from_literal) + ")"
		if not is_elem_kind(kind):
			return out
		return "rt.stampArray(" + out + ", " + JSON.stringify(kind) + ", " + str(from_literal) + ")"
	var parts = []
	for p in inner.split(","):
		parts.append(p.strip_edges())
	if parts.size() != 2:
		return out
	var key_kind = _slot_elem_kind_name(parts[0])
	var val_kind = _slot_elem_kind_name(parts[1])
	if key_kind == null or val_kind == null:
		return out
	return "rt.stampDict(" + out + ", " + JSON.stringify(key_kind) + ", " + JSON.stringify(val_kind) + ", " + str(from_literal) + ")"

static func json_quote(text):
	var bs = String.chr(92)
	var q = String.chr(34)
	var out = q
	for ch in String(text):
		var cp = ch.unicode_at(0)
		if ch == q:
			out += bs + q
		elif ch == bs:
			out += bs + bs
		elif cp == 8:
			out += bs + "b"
		elif cp == 9:
			out += bs + "t"
		elif cp == 10:
			out += bs + "n"
		elif cp == 12:
			out += bs + "f"
		elif cp == 13:
			out += bs + "r"
		elif cp < 32:
			out += bs + "u" + ("%04x" % cp)
		else:
			out += ch
	return out + q


static func mark(gen_line, loc):
	if not CTX.ctx["MAP_ACTIVE"] or loc == null:
		return
	CTX.ctx["LINE_MAPPINGS"].append({"genLine": gen_line, "srcLine": loc["line"] - 1, "srcCol": loc["col"] - 1})


static func _gc_expr(used, e):
	if e == null:
		return
	var kind = e.get("kind")
	if kind == "ident":
		if GLOB.is_global_const(e["name"]):
			used[e["name"]] = true
		return
	if kind == "binary":
		_gc_expr(used, e["left"])
		_gc_expr(used, e["right"])
		return
	if kind == "ternary":
		_gc_expr(used, e["cond"])
		_gc_expr(used, e["thenE"])
		_gc_expr(used, e["elseE"])
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_gc_expr(used, e["operand"])
		return
	if kind == "index":
		_gc_expr(used, e["obj"])
		_gc_expr(used, e["index"])
		return
	if kind == "attribute":
		_gc_expr(used, e["obj"])
		return
	if kind == "call":
		_gc_expr(used, e["callee"])
		for a in e["args"]:
			_gc_expr(used, a)
		return
	if kind == "lambda":
		for st in e["body"]:
			_gc_stmt(used, st)
		return
	if kind == "array":
		for it in e["items"]:
			_gc_expr(used, it)
		return
	if kind == "dict":
		for en in e["entries"]:
			_gc_expr(used, en["key"])
			_gc_expr(used, en["value"])
		return


static func _gc_stmt(used, s):
	var kind = s.get("kind")
	if kind == "expr":
		_gc_expr(used, s["expr"])
		return
	if kind == "var":
		_gc_expr(used, s.get("init"))
		return
	if kind == "assign":
		_gc_expr(used, s["target"])
		_gc_expr(used, s["value"])
		return
	if kind == "if":
		for b in s["branches"]:
			if b.get("cond") != null:
				_gc_expr(used, b["cond"])
			for x in b["body"]:
				_gc_stmt(used, x)
		return
	if kind == "for":
		_gc_expr(used, s["iter"])
		for x in s["body"]:
			_gc_stmt(used, x)
		return
	if kind == "while":
		_gc_expr(used, s["cond"])
		for x in s["body"]:
			_gc_stmt(used, x)
		return
	if kind == "match":
		_gc_expr(used, s["subject"])
		for arm in s["arms"]:
			if arm.get("guard") != null:
				_gc_expr(used, arm["guard"])
			for x in arm["body"]:
				_gc_stmt(used, x)
		return
	if kind == "return":
		if s.get("value") != null:
			_gc_expr(used, s["value"])


static func _gc_func(used, f):
	for p in f["params"]:
		_gc_expr(used, p.get("default"))
	for st in f["body"]:
		_gc_stmt(used, st)


static func _gc_class(used, c):
	for f in c["funcs"]:
		_gc_func(used, f)
	for v in c["vars"]:
		_gc_expr(used, v.get("init"))
	for inner in c["innerClasses"]:
		_gc_class(used, inner)


static func _gc_reserved(reserved, list):
	for c in list:
		reserved[c["name"]] = true
		for v in c["vars"]:
			reserved[v["name"]] = true
		_gc_reserved(reserved, c["innerClasses"])


static func global_const_lines(m, reserved_extra):
	var reserved = reserved_extra.duplicate()
	for en in m["enums"]:
		if en.get("name") != null:
			reserved[en["name"]] = true
		for mm in en["members"]:
			reserved[mm["name"]] = true
	if m.get("className") != null:
		reserved[m["className"]] = true
	_gc_reserved(reserved, m["innerClasses"])
	var used = {}
	for f in m["funcs"]:
		_gc_func(used, f)
	for v in m["vars"]:
		_gc_expr(used, v.get("init"))
	for c in m["innerClasses"]:
		_gc_class(used, c)
	var names = []
	for n in used.keys():
		if not reserved.has(n):
			names.append(n)
	names.sort()
	var out = []
	for n in names:
		var c2 = GLOB.GLOBAL_CONSTANTS[n]
		var ctor = "rt.V.int" if c2[0] == "int" else "rt.V.float"
		out.append("const " + n + " = " + ctor + "(" + c2[1] + ");")
	return out

static func int_div_may_abort(e, ik):
	var AB = load("res://abi.gd")
	var kind = e.get("kind")
	if kind == "binary":
		if e.get("op") == "/" or e.get("op") == "%":
			if AB.kind_of_expr(e["left"], ik) == "int":
				var r = e["right"]
				if not (r.get("kind") == "lit" and r.get("lit") == "int" and r.get("value") != 0):
					return true
		return int_div_may_abort(e["left"], ik) or int_div_may_abort(e["right"], ik)
	if kind == "unary":
		return int_div_may_abort(e["operand"], ik)
	if kind == "index":
		return int_div_may_abort(e["obj"], ik) or int_div_may_abort(e["index"], ik)
	if kind == "call":
		if int_div_may_abort(e["callee"], ik):
			return true
		for a in e["args"]:
			if int_div_may_abort(a, ik):
				return true
		return false
	return false


static func sig_valid(f, K, sites, u_of):
	var AB = load("res://abi.gd")
	var env = {}
	for p in f["params"]:
		env[p["name"]] = K
	var seen_return = false
	for st in f["body"]:
		var kind = st.get("kind")
		if kind == "var":
			if st.get("init") == null or AB.kind_of_expr(st["init"], env) != K:
				return false
			if int_div_may_abort(st["init"], env):
				return false
			env[st["name"]] = K
		elif kind == "assign":
			if st["target"].get("kind") != "ident" or not env.has(st["target"]["name"]):
				return false
			if AB.kind_of_expr(st["value"], env) != K:
				return false
			if int_div_may_abort(st["value"], env):
				return false
		elif kind == "return":
			if st.get("value") == null or AB.kind_of_expr(st["value"], env) != K:
				return false
			if int_div_may_abort(st["value"], env):
				return false
			seen_return = true
		else:
			return false
	if not seen_return:
		return false
	for s in sites:
		if s["args"].size() != f["params"].size():
			return false
		var u = u_of.get(s["owner"]["name"])
		if u == null:
			u = {}
		for a in s["args"]:
			if AB.kind_of_expr(a, u, {}, {}) != K:
				return false
	return true

static func _wp_expr(e):
	return load("res://expr_boxed.gd").emit_expr(e)


static func lvalue_of(t, seq):
	var kind = t.get("kind")
	if kind == "ident":
		var read = _wp_expr(t)
		if CTX.ctx["INNER_CLASSES"].has(t["name"]) or t["name"] == CTX.ctx["CURRENT_CLASS"]:
			return {"kind": "none", "read": read, "pre": []}
		return {"kind": "assign", "read": read, "pre": []}
	if kind == "index":
		var base = lvalue_of(t["obj"], seq)
		if base == null:
			return null
		var key = "_w" + str(seq["n"])
		seq["n"] += 1
		var pre = base["pre"].duplicate()
		pre.append("const " + key + " = " + _wp_expr(t["index"]) + ";")
		return {"kind": "index", "read": "rt.index(" + base["read"] + ", " + key + ")", "base": base["read"], "key": key, "pre": pre}
	if kind == "attribute":
		var base2 = lvalue_of(t["obj"], seq)
		if base2 == null:
			return null
		var nm = JSON.stringify(t["name"])
		return {"kind": "prop", "read": "rt.attribute(" + base2["read"] + ", " + nm + ")", "base": base2["read"], "name": nm, "pre": base2["pre"].duplicate()}
	return null


static func _wp_store(p, nv):
	var kind = p["kind"]
	if kind == "assign":
		return p["read"] + " = " + nv + ";"
	if kind == "index":
		return "rt.setIndex(" + p["base"] + ", " + p["key"] + ", " + nv + ");"
	if kind == "prop":
		return "rt.writeProp(" + p["base"] + ", " + p["name"] + ", " + nv + ");"
	return ""


static func write_back(p, call):
	var store = _wp_store(p, "_nv")
	if store == "":
		return [call + ";"]
	var out = ["{"]
	for l in p["pre"]:
		out.append(l)
	out.append("  const _nv = " + call + ";")
	out.append("  if (_nv !== null) " + store)
	out.append("}")
	return out


static func write_path_for(t, seq):
	var p = lvalue_of(t, seq)
	if p != null:
		return p
	return {"kind": "none", "read": _wp_expr(t), "pre": []}


static func pack_typed_args(fn_name, arg_exprs, emitted, recv):
	var ps = CTX.ctx["PARAM_TYPES"].get(fn_name)
	if ps == null:
		return emitted
	var out = []
	for i in emitted.size():
		var a = emitted[i]
		if ps.size() <= i or arg_exprs.size() <= i:
			out.append(a)
			continue
		var p = ps[i]
		var e = arg_exprs[i]
		var text = container_ann_text(p.get("type"))
		if text == null:
			out.append(a)
			continue
		if e.get("kind") == "array" or e.get("kind") == "dict":
			var inner = text
			if inner.begins_with("Array["):
				inner = inner.substr(6, inner.length() - 7)
			elif inner.begins_with("Dictionary["):
				inner = inner.substr(11, inner.length() - 12)
			var parts = []
			for x in inner.split(","):
				parts.append(x.strip_edges())
			var one = parts[0] if parts.size() > 0 else ""
			if text.begins_with("Array["):
				var script_base = CTX.ctx["SCRIPT_BASE"].get(one)
				if script_base != null:
					out.append("rt.stampScriptArray(" + a + ", " + JSON.stringify(one) + ", " + JSON.stringify(script_base) + ", true)")
					continue
				if NATIVE_CLASS_SLOTS.has(one):
					out.append("rt.stampClassArray(" + a + ", " + JSON.stringify(one) + ", true)")
				else:
					out.append("rt.stampArray(" + a + ", " + JSON.stringify(one) + ", true)")
				continue
			var second = parts[1] if parts.size() > 1 else ""
			out.append("rt.stampDict(" + a + ", " + JSON.stringify(one) + ", " + JSON.stringify(second) + ", true)")
			continue
		out.append("rt.paramContainer(" + a + ", " + JSON.stringify(text) + ", " + str(i + 1) + ", " + JSON.stringify(fn_name) + ", " + recv + ")")
	return out

static func _kind_of(e, ids, arrays = null, dict = null) -> Variant:
	return load("res://abi.gd").kind_of_expr(e, ids, arrays, dict)


static func _elem_of_init(init, nested = false) -> Variant:
	return load("res://abi.gd").elem_kind_from_init(init, nested)


static func _grid_elem(k):
	return load("res://abi.gd").is_grid_elem(k)


static func _leaf(k) -> Variant:
	return load("res://abi.gd").leaf_of(k)


static func _pattern_names(p):
	return load("res://layout.gd").pattern_names(p)


static func _ac_pre(cands, s):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("type") == null and s.get("init") != null and s["init"].get("kind") == "array":
			cands[s["name"]] = {"init": s["init"], "writeElems": [], "readIdxs": [], "writeIdxs": [], "writeVals": [], "escaped": false}
	elif kind == "if":
		for b in s["branches"]:
			for x in b["body"]:
				_ac_pre(cands, x)
	elif kind == "for" or kind == "while":
		for x in s["body"]:
			_ac_pre(cands, x)
	elif kind == "match":
		for a in s["arms"]:
			for x in a["body"]:
				_ac_pre(cands, x)


static func _ac_is_grid(c) -> Variant:
	var k = _elem_of_init(c["init"], true)
	return k != null and _grid_elem(k)


static func _ac_match_write(cands, t) -> Variant:
	if t.get("kind") != "index":
		return null
	if t["obj"].get("kind") == "ident":
		var c = cands.get(t["obj"]["name"])
		if c != null and not _ac_is_grid(c):
			return {"name": t["obj"]["name"], "idxs": [t["index"]]}
		return null
	if t["obj"].get("kind") == "index" and t["obj"]["obj"].get("kind") == "ident":
		var c2 = cands.get(t["obj"]["obj"]["name"])
		if c2 != null and _ac_is_grid(c2):
			return {"name": t["obj"]["obj"]["name"], "idxs": [t["obj"]["index"], t["index"]]}
	return null


static func _ac_expr(cands, e, in_l, discarded = false):
	var kind = e.get("kind")
	if kind == "ident":
		if cands.has(e["name"]):
			cands[e["name"]]["escaped"] = true
		return
	if kind == "call":
		if e["callee"].get("kind") == "attribute":
			var obj = e["callee"]["obj"]
			if obj.get("kind") == "ident" and cands.has(obj["name"]):
				var c = cands[obj["name"]]
				var n = e["callee"].get("name")
				var argc = e["args"].size()
				if in_l:
					c["escaped"] = true
				elif (n == "append" or n == "push_back") and argc == 1:
					c["writeElems"].append(e["args"][0])
				elif (n == "size" or n == "length") and argc == 0:
					pass
				elif n == "insert" and argc == 2:
					c["writeIdxs"].append(e["args"][0])
					c["writeElems"].append(e["args"][1])
				elif n == "remove_at" and argc == 1:
					c["writeIdxs"].append(e["args"][0])
				elif n == "push_front" and argc == 1:
					c["writeElems"].append(e["args"][0])
				elif n == "fill" and argc == 1:
					c["writeElems"].append(e["args"][0])
				elif n == "clear" and argc == 0:
					pass
				elif n == "reverse" and argc == 0:
					pass
				elif discarded and n == "pop_back" and argc == 0:
					pass
				elif discarded and n == "pop_front" and argc == 0:
					pass
				elif discarded and n == "pop_at" and argc == 1:
					c["readIdxs"].append(e["args"][0])
				else:
					c["escaped"] = true
				for a in e["args"]:
					_ac_expr(cands, a, in_l)
				return
			_ac_expr(cands, e["callee"], in_l)
			for a in e["args"]:
				_ac_expr(cands, a, in_l)
			return
		_ac_expr(cands, e["callee"], in_l)
		for a in e["args"]:
			_ac_expr(cands, a, in_l)
		return
	if kind == "index":
		var mid = e["obj"]
		if mid.get("kind") == "index" and mid["obj"].get("kind") == "ident" and cands.has(mid["obj"]["name"]):
			var c2 = cands[mid["obj"]["name"]]
			if in_l or not _ac_is_grid(c2):
				c2["escaped"] = true
			else:
				c2["readIdxs"].append(mid["index"])
				c2["readIdxs"].append(e["index"])
			_ac_expr(cands, mid["index"], in_l)
			_ac_expr(cands, e["index"], in_l)
			return
		var obj2 = e["obj"]
		if obj2.get("kind") == "ident" and cands.has(obj2["name"]):
			var c3 = cands[obj2["name"]]
			if in_l or _ac_is_grid(c3):
				c3["escaped"] = true
			else:
				c3["readIdxs"].append(e["index"])
			_ac_expr(cands, e["index"], in_l)
			return
		_ac_expr(cands, e["obj"], in_l)
		_ac_expr(cands, e["index"], in_l)
		return
	if kind == "attribute":
		_ac_expr(cands, e["obj"], in_l)
		return
	if kind == "binary":
		_ac_expr(cands, e["left"], in_l)
		_ac_expr(cands, e["right"], in_l)
		return
	if kind == "ternary":
		for br in [e["thenE"], e["elseE"]]:
			if br.get("kind") == "ident" and cands.has(br["name"]):
				cands[br["name"]]["escaped"] = true
			_ac_expr(cands, br, in_l)
		_ac_expr(cands, e["cond"], in_l)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_ac_expr(cands, e["operand"], in_l)
		return
	if kind == "array":
		for it in e["items"]:
			_ac_expr(cands, it, in_l)
		return
	if kind == "dict":
		for en in e["entries"]:
			_ac_expr(cands, en["key"], in_l)
			_ac_expr(cands, en["value"], in_l)
		return
	if kind == "lambda":
		for s in e["body"]:
			_ac_stmt(cands, s, true)
		return


static func _ac_stmt(cands, s, in_l):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("init") != null:
			_ac_expr(cands, s["init"], in_l)
		return
	if kind == "assign":
		var w = _ac_match_write(cands, s["target"])
		if w != null and not in_l:
			var c = cands[w["name"]]
			for ix in w["idxs"]:
				c["writeIdxs"].append(ix)
			c["writeVals"].append(s["value"])
			for ix2 in w["idxs"]:
				_ac_expr(cands, ix2, in_l)
			_ac_expr(cands, s["value"], in_l)
			return
		var wt: Variant = null
		if s["target"].get("kind") == "index":
			var o = s["target"]["obj"]
			if o.get("kind") == "ident" and cands.has(o["name"]):
				wt = o["name"]
		elif s["target"].get("kind") == "ident" and cands.has(s["target"]["name"]):
			wt = s["target"]["name"]
		if wt != null:
			cands[wt]["escaped"] = true
		if w != null:
			cands[w["name"]]["escaped"] = true
		_ac_expr(cands, s["target"], in_l)
		_ac_expr(cands, s["value"], in_l)
		return
	if kind == "expr":
		_ac_expr(cands, s["expr"], in_l, true)
		return
	if kind == "return":
		if s.get("value") != null:
			_ac_expr(cands, s["value"], in_l)
		return
	if kind == "if":
		for b in s["branches"]:
			if b.get("cond") != null:
				_ac_expr(cands, b["cond"], in_l)
			for x in b["body"]:
				_ac_stmt(cands, x, in_l)
		return
	if kind == "for":
		_ac_expr(cands, s["iter"], in_l)
		for x in s["body"]:
			_ac_stmt(cands, x, in_l)
		return
	if kind == "while":
		_ac_expr(cands, s["cond"], in_l)
		for x in s["body"]:
			_ac_stmt(cands, x, in_l)
		return
	if kind == "match":
		_ac_expr(cands, s["subject"], in_l)
		for a in s["arms"]:
			if a.get("guard") != null:
				_ac_expr(cands, a["guard"], in_l)
			for x in a["body"]:
				_ac_stmt(cands, x, in_l)
		return
	if kind == "break" or kind == "continue" or kind == "pass":
		return


static func scan_array_candidates(f):
	var cands = {}
	for s in f["body"]:
		_ac_pre(cands, s)
	for s in f["body"]:
		_ac_stmt(cands, s, false)
	return cands


static func _dc_pre(cands, s):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("type") == null and s.get("init") != null and s["init"].get("kind") == "dict":
			cands[s["name"]] = {"init": s["init"], "writeKeys": [], "writeVals": [], "readKeys": [], "escaped": false}
	elif kind == "if":
		for b in s["branches"]:
			for x in b["body"]:
				_dc_pre(cands, x)
	elif kind == "for" or kind == "while":
		for x in s["body"]:
			_dc_pre(cands, x)
	elif kind == "match":
		for a in s["arms"]:
			for x in a["body"]:
				_dc_pre(cands, x)


static func _dc_expr(cands, e, in_l):
	var kind = e.get("kind")
	if kind == "ident":
		if cands.has(e["name"]):
			cands[e["name"]]["escaped"] = true
		return
	if kind == "call":
		if e["callee"].get("kind") == "attribute":
			var obj = e["callee"]["obj"]
			if obj.get("kind") == "ident" and cands.has(obj["name"]):
				var c = cands[obj["name"]]
				var n = e["callee"].get("name")
				var argc = e["args"].size()
				if in_l:
					c["escaped"] = true
				elif (n == "size" or n == "length") and argc == 0:
					pass
				elif n == "get" and argc == 2:
					c["readKeys"].append(e["args"][0])
					c["writeVals"].append(e["args"][1])
				else:
					c["escaped"] = true
				for a in e["args"]:
					_dc_expr(cands, a, in_l)
				return
			_dc_expr(cands, e["callee"], in_l)
			for a in e["args"]:
				_dc_expr(cands, a, in_l)
			return
		_dc_expr(cands, e["callee"], in_l)
		for a in e["args"]:
			_dc_expr(cands, a, in_l)
		return
	if kind == "index":
		var obj2 = e["obj"]
		if obj2.get("kind") == "ident" and cands.has(obj2["name"]):
			var c2 = cands[obj2["name"]]
			if in_l:
				c2["escaped"] = true
			else:
				c2["readKeys"].append(e["index"])
			_dc_expr(cands, e["index"], in_l)
			return
		_dc_expr(cands, e["obj"], in_l)
		_dc_expr(cands, e["index"], in_l)
		return
	if kind == "attribute":
		_dc_expr(cands, e["obj"], in_l)
		return
	if kind == "binary":
		_dc_expr(cands, e["left"], in_l)
		_dc_expr(cands, e["right"], in_l)
		return
	if kind == "ternary":
		for br in [e["thenE"], e["elseE"]]:
			if br.get("kind") == "ident" and cands.has(br["name"]):
				cands[br["name"]]["escaped"] = true
			_dc_expr(cands, br, in_l)
		_dc_expr(cands, e["cond"], in_l)
		return
	if kind == "unary" or kind == "await" or kind == "is" or kind == "as":
		_dc_expr(cands, e["operand"], in_l)
		return
	if kind == "array":
		for it in e["items"]:
			_dc_expr(cands, it, in_l)
		return
	if kind == "dict":
		for en in e["entries"]:
			_dc_expr(cands, en["key"], in_l)
			_dc_expr(cands, en["value"], in_l)
		return
	if kind == "lambda":
		for s in e["body"]:
			_dc_stmt(cands, s, true)
		return


static func _dc_stmt(cands, s, in_l):
	var kind = s.get("kind")
	if kind == "var":
		if s.get("init") != null:
			_dc_expr(cands, s["init"], in_l)
		return
	if kind == "assign":
		if s["target"].get("kind") == "index":
			var obj = s["target"]["obj"]
			if obj.get("kind") == "ident" and cands.has(obj["name"]):
				var c = cands[obj["name"]]
				if in_l:
					c["escaped"] = true
				else:
					c["writeKeys"].append(s["target"]["index"])
					c["writeVals"].append(s["value"])
				_dc_expr(cands, s["target"], in_l)
				_dc_expr(cands, s["value"], in_l)
				return
		if s["target"].get("kind") == "ident" and cands.has(s["target"]["name"]):
			cands[s["target"]["name"]]["escaped"] = true
		_dc_expr(cands, s["target"], in_l)
		_dc_expr(cands, s["value"], in_l)
		return
	if kind == "expr":
		_dc_expr(cands, s["expr"], in_l)
		return
	if kind == "return":
		if s.get("value") != null:
			_dc_expr(cands, s["value"], in_l)
		return
	if kind == "if":
		for b in s["branches"]:
			if b.get("cond") != null:
				_dc_expr(cands, b["cond"], in_l)
			for x in b["body"]:
				_dc_stmt(cands, x, in_l)
		return
	if kind == "for":
		_dc_expr(cands, s["iter"], in_l)
		for x in s["body"]:
			_dc_stmt(cands, x, in_l)
		return
	if kind == "while":
		_dc_expr(cands, s["cond"], in_l)
		for x in s["body"]:
			_dc_stmt(cands, x, in_l)
		return
	if kind == "match":
		_dc_expr(cands, s["subject"], in_l)
		for a in s["arms"]:
			if a.get("guard") != null:
				_dc_expr(cands, a["guard"], in_l)
			for x in a["body"]:
				_dc_stmt(cands, x, in_l)
		return
	if kind == "break" or kind == "continue" or kind == "pass":
		return


static func scan_dict_candidates(f):
	var cands = {}
	for s in f["body"]:
		_dc_pre(cands, s)
	for s in f["body"]:
		_dc_stmt(cands, s, false)
	return cands


static func verify_array(c, K, unboxed, arrays, dicts):
	if c["init"]["items"].size() != 0 and _elem_of_init(c["init"], true) != K:
		return false
	if not _grid_elem(K):
		for it in c["init"]["items"]:
			if it.get("kind") == "lit":
				continue
			if _kind_of(it, unboxed, arrays, dicts) != K:
				return false
	for w in c["writeElems"]:
		if _kind_of(w, unboxed, arrays, dicts) != K:
			return false
	for r in c["readIdxs"]:
		if _kind_of(r, unboxed, arrays, dicts) != "int":
			return false
	var leaf = _leaf(K) if _grid_elem(K) else K
	for v in c["writeVals"]:
		if _kind_of(v, unboxed, arrays, dicts) != leaf:
			return false
	for ix in c["writeIdxs"]:
		if _kind_of(ix, unboxed, arrays, dicts) != "int":
			return false
	return true


static func verify_dict(c, K, unboxed, arrays, dicts):
	for en in c["init"]["entries"]:
		if not load("res://abi.gd").key_kind_ok(_kind_of(en["key"], unboxed, arrays, dicts)):
			return false
		if _kind_of(en["value"], unboxed, arrays, dicts) != K:
			return false
	for k in c["writeKeys"]:
		if not load("res://abi.gd").key_kind_ok(_kind_of(k, unboxed, arrays, dicts)):
			return false
	for v in c["writeVals"]:
		if _kind_of(v, unboxed, arrays, dicts) != K:
			return false
	for k2 in c["readKeys"]:
		if not load("res://abi.gd").key_kind_ok(_kind_of(k2, unboxed, arrays, dicts)):
			return false
	return true


static func analyze_func_layout(f):
	var a_c = scan_array_candidates(f)
	var d_c = scan_dict_candidates(f)
	var arrays = {}
	for name in a_c:
		if a_c[name]["escaped"]:
			continue
		var k = load("res://abi.gd").array_elem_kind(a_c[name])
		if k != null:
			arrays[name] = k
	var dicts = {}
	for name in d_c:
		if d_c[name]["escaped"]:
			continue
		var vals = []
		for en in d_c[name]["init"]["entries"]:
			vals.append(en["value"])
		var k2 = _elem_of_init({"kind": "array", "items": vals, "loc": d_c[name]["init"].get("loc")})
		if k2 == "int" or k2 == "float":
			dicts[name] = k2
	var unboxed = load("res://abi.gd").compute_unboxed(f, arrays, dicts)
	var seeded = {}
	var cap = a_c.size() * 2 + d_c.size() + 8
	for it in cap:
		var changed = false
		for name2 in a_c:
			var c = a_c[name2]
			if c["escaped"] or arrays.has(name2) or seeded.has(name2) or c["init"]["items"].size() != 0:
				continue
			var kinds = []
			for e in c["writeElems"]:
				kinds.append(_kind_of(e, unboxed, arrays, dicts))
			for e2 in c["writeVals"]:
				kinds.append(_kind_of(e2, unboxed, arrays, dicts))
			if kinds.is_empty():
				continue
			var first = kinds[0]
			if first == null or first == "bool":
				continue
			var same = true
			for kk in kinds:
				if kk != first:
					same = false
					break
			if not same:
				continue
			arrays[name2] = first
			seeded[name2] = true
			changed = true
		var arr_names = arrays.keys().duplicate()
		for name3 in arr_names:
			var c2 = a_c.get(name3)
			if c2 == null or c2["escaped"] or not verify_array(c2, arrays[name3], unboxed, arrays, dicts):
				arrays.erase(name3)
				changed = true
		var dict_names = dicts.keys().duplicate()
		for name4 in dict_names:
			var c3 = d_c.get(name4)
			if c3 == null or c3["escaped"] or not verify_dict(c3, dicts[name4], unboxed, arrays, dicts):
				dicts.erase(name4)
				changed = true
		var un2 = load("res://abi.gd").compute_unboxed(f, arrays, dicts)
		var un_changed = not maps_equal(un2, unboxed)
		unboxed = un2
		if not changed and not un_changed:
			break
	return {"unboxed": unboxed, "arrays": arrays, "dicts": dicts}
