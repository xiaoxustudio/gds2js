extends SceneTree

const L = preload("res://lexer.gd")
const I = preload("res://indent.gd")
const S = preload("res://state.gd")
const D = preload("res://diag.gd")
const C = preload("res://cst.gd")
const LI = preload("res://lit.gd")
const E = preload("res://expr.gd")
const SR = preload("res://source.gd")
const B = preload("res://builder.gd")
const DB = preload("res://double.gd")
const LE = preload("res://lower_expr.gd")
const LO = preload("res://lower.gd")
const AS = preload("res://analyze_state.gd")
const LF = preload("res://literals.gd")
const MA = preload("res://method_arity.gd")
const HP = preload("res://helpers.gd")
const IRF = preload("res://ir.gd")
const NF = preload("res://node_face.gd")
const SC = preload("res://scene.gd")
const WK = preload("res://walk.gd")
const SL = preload("res://slots.gd")
const CTX = preload("res://context.gd")
const FC = preload("res://faces.gd")
const AB = preload("res://abi.gd")
const LAY = preload("res://layout.gd")
const AR = preload("res://arity.gd")
const FN = preload("res://func.gd")
const CL = preload("res://class.gd")
const VA = preload("res://var_assign.gd")
const PK = preload("res://pack.gd")
const HL = preload("res://home_lib.gd")
const TY = preload("res://typed.gd")
const DE = preload("res://decls.gd")
const OP = preload("res://operators.gd")
const CA = preload("res://calls.gd")
const T = preload("res://arity_tables.gd")
const IX = preload("res://index_slots.gd")
const AZ = preload("res://analyze_idx.gd")
const ME = preload("res://module_emit.gd")
const PJ = preload("res://project.gd")
const EB = preload("res://expr_boxed.gd")
const CALL = preload("res://call.gd")
const BT = preload("res://builtin_tables.gd")
const ES = preload("res://emit_stmt.gd")


func _initialize():
	show("m01", "var x = 42\nfunc f(a):\n\treturn \"hi\"\t# tail\n")
	show("m02", "a1 = 3.5\n\tif b>=c:\n\t\tprint(2)\n")
	show("m03", "x = \"unclosed\ny = 1\n")
	show("m04", "op = 1\nz = 2\n")
	show("m05", "id_é = 1\n\ttab = 2\n")
	show("m06", "0x1F 0b1010 0o17 1_000 3.5e-3 .5 1. 1..2 2 **= 3 super._init()\n")
	show("m07", "r\"C:\\tmp\" &\"NodeName\" ^\"A/B\" @\"C\" \"\"\"triple\nline\"\"\" '''tri'''\n")
	show("m08", "\"a\\u00e9b\" \"c\\U01F600d\" \"e\\\\f\" \"g\\x41h\" \"i\\o101j\"\n")
	show("m09", "#region 标题\nx = 1\n#endregion\n")
	show("m10", "bad = \"a\\qb\"\n")
	show("m11", "zwm = \uFEFF1 + \u200B2\n")
	show("m12", "中变量 = 2\n😀 = 3\n")
	walk("w01", "var x = 1\n\tif x:\n\t\tprint(2)\n\telse:\n\t\tprint(3)\nvar y = 2\n")
	walk("w02", "func f(a):\n\tvar s = \"x\"  # 尾注释\n\treturn a\n")
	parse("p01", "a, (b, -3), 4.5")
	parse("p02", "(a, b")
	parse("p03", "@bad")
	parse("p04", "(, 1)")
	lit_face()
	expr_face()
	source_face()
	match_bisect()
	double_face()
	ir_face()
	module_face()
	state_face()
	literal_face()
	dup_face()
	helpers_face()
	micro_face()
	scene_face()
	walk_face()
	slots_face()
	context_face()
	faces_face()
	abi_face()
	layout_face()
	arity_face()
	fn_face()
	class_face()
	stype_face()
	va_face()
	helpers2_face()
	faces3_face()
	static3_face()
	faces4_face()
	pack4_face()
	pack5_face()
	attr_scope_face()
	slots6_face()
	slots7_face()
	home_face()
	typed_face()
	decls_face()
	op_face()
	meth_face()
	mark_face()
	gconst_face()
	scope_face()
	sc_face()
	ca_face()
	ic_face()
	cfv_face()
	faces5_face()
	calls_face()
	sma_face()
	cfa_face()
	nf_face()
	fas_face()
	lay2_face()
	abi3_face()
	lay3_face()
	ida_face()
	walk2_face()
	cls_face()
	ix_face()
	vm_face()
	pk6_face()
	az_face()
	di_face()
	el_face()
	ex_face()
	bc_face()
	st_face()
	fl_face()
	rb_face()
	fn2_face()
	cd_face()
	ra_face()
	me_face()
	pj_face()
	quit()


func expr_face():
	for text in ["1 + 2 * 3", "a.b(c)[d]", "not x and y or z", "x if c else y", "[1, 2, ..]", "a ** b ** c", "-x ** 2", "f(1, g(2))", "(a)", "x is int", "&\"name\" + ^\"p/q\"", "$Node/Sub", "%Uniq", "\"s\"", "{}", "func(a): return a", "func(): return 1 + 2", "func(a: int = 1): return a"]:
		print("e|", text)
		for r in E.dump_expr(text):
			print(r)



func lit_face():
	print("k|", LI.lower_int_lit("1_000_000"), "|", LI.lower_int_lit("0x1F"), "|", LI.lower_int_lit("0b1010"), "|", LI.lower_int_lit("0o17"), "|", LI.lower_int_lit("9223372036854775807"), "|", LI.lower_int_lit("-42"))
	print("l|", LI.strip_amp("&\"abc\""), "|", LI.strip_caret("^\"A/B\""))
	var q = "\""
	print("m|", LI.unquote(q + "abc" + q), "|", LI.unquote(q + "a\\nb" + q).length(), "|", LI.unquote(q + "a\\tb\\r" + q).length())
	print("n|", LI.unquote(q + "\\u00e9" + q), "|", LI.unquote(q + "\\U01F600" + q).length(), "|", LI.unquote(q + "\\uD83D\\uDE00" + q).length())
	print("o|", LI.unquote(q + "\\a\\b\\f\\v" + q).length(), "|", LI.unquote(q + "\\\\x" + q))
	var bad = LI.unquote(q + "a\\qb" + q)
	print("p|", LI.is_error(bad), "|", bad["code"], "|", bad["message"])
	var lone = LI.unquote(q + "\\uD800" + q)
	print("r|", LI.is_error(lone), "|", lone["message"])
	var trail = LI.unquote(q + "\\uDC00" + q)
	print("s|", LI.is_error(trail), "|", trail["message"])



func cst_face():
	var tree = S.parse_tree("(a, -b)", 12)
	var idx = C.index_tree(tree)
	var order = C.order_of(tree, [])
	for n in order:
		print("c|", n["id"], "|", n["type"], "|", C.in_brackets(n, idx), "|", C.last_row(n), "|", C.loc(n)["line"])
	var group = order[0]
	for n in order:
		if n["type"] == "parenthesized_expression":
			group = n
	print("d|", group["fieldName"] == "body", "|", C.token_of(group, "(") != null, "|", C.operator_of(group))
	print("e|", C.lower_type({"type": "inferred_type", "text": ""})["kind"], "|", C.lower_type({"type": "type", "text": "Array[int]"})["name"])
	var kids = group["children"]
	print("f|", C.check_colon_here(group, "colon-here") == null, "|", C.check_after_token(group, kids[0], kids[1], "after-token") == null)
	print("g|", C.syntax_err_of({"syntaxErrors": []}) == null)
	var bad = C.syntax_err_of({"syntaxErrors": [{"sentence": "", "context": "item", "row": 0, "column": 1, "got": "@", "reportRow": 0, "code": "line-continuation"}]})
	print("h|", bad["sentence"], "|", bad["code"], "|", bad["line"])
	var miss = C.need(null, "if 体")
	print("i|", C.is_error(miss), "|", miss["code"])
	print("j|", C.named(group).size(), "|", C.operator_token(group) == null)


func parse(tag, src):
	print("parse|", tag, "|", src.length())
	for r in S.run(src, 12):
		print(r)


func walk(tag, src):
	for mode in 4:
		print("mode|", tag, "|", mode)
		for r in I.walk(src, mode):
			print(r)


func show(tag, src):
	print("case|", tag, "|", src.length())
	var res = L.lex(src)
	for t in res["tokens"]:
		print("tk|", t["kind"], "|", t["start"], "|", t["end"], "|", t["row"], "|", t["col"], "|", t["lineStart"], "|", t["indent"], "|", t["text"])
	for e in res["issues"]:
		print("is|", e["at"], "|", e["row"], "|", e["col"], "|", e["message"])

static var SAMPLE_SOURCES = ["var x = 1", "func f(a: int, b := 2) -> int:\n\treturn a + b", "const K = 3\nsignal ping(a)\nclass_name Foo\nextends Node", "if a:\n\tf()\nelif b:\n\tg()\nelse:\n\th()", "for i in range(3):\n\tprint(i)", "while x:\n\tx -= 1", "match v:\n\t1, 2:\n\t\tprint(1)\n\tvar w when w > 0:\n\t\tprint(w)\n\t_:\n\t\tprint(0)", "class Inner extends Node:\n\tvar p = 1\n\n\tfunc _init():\n\t\tp = 2", "enum E { A, B = 2, C }", "var q:\n\tget:\n\t\treturn 1\n\tset(v):\n\t\tpass", "class C:\n\tvar r: int = 1\n", "x += 1; y = 2", "func _init():\n\tpass", "static func g():\n\tpass", "func f(x):\n\tif x > 0:\n\t\treturn x\n\tfor i in range(x):\n\t\tprint(i)\n\twhile x:\n\t\tx -= 1\n\tmatch x:\n\t\t1:\n\t\t\treturn \"one\"\n\t\tvar w when w > 5:\n\t\t\treturn \"big\"\n\t\tvar z:\n\t\t\treturn z\n", "class A:\n\tvar p: int = 1\n\n\tfunc _init():\n\t\tp = 2\n\n\tfunc get_p():\n\t\treturn p\n\n\nclass B extends A:\n\tfunc get_p():\n\t\treturn super.get_p()", "var g:\n\tget:\n\t\treturn 1\n\tset(v):\n\t\tpass", "func h(a, b = 2, c := 3, d: int = 4):\n\treturn a"]

func source_face():
	for text in SAMPLE_SOURCES:
		one_source(text)


func match_bisect():
	one_source("match v:\n\t_:\n\t\tprint(0)\n")
	one_source("match v:\n\t1:\n\t\tprint(1)\n")
	one_source("match v:\n\tvar w:\n\t\tprint(w)\n")
	one_source("match v:\n\tvar w when w > 0:\n\t\tprint(w)\n")
	one_source("match v:\n\t1, 2:\n\t\tprint(1)\n")


func one_source(text):
	var res = SR.parse_source(text)
	print("s|", text.length(), "|", res["syntaxErrors"].size(), "|", text.replace("\n", "~n").replace("\t", "~t"))
	for e in res["syntaxErrors"]:
		print("se|", e["context"], "|", e["got"], "|", e["row"], "|", e["column"])
	for r in B.dump(res["rootNode"], 0, []):
		print(r)

func double_face():
	for t in ["1", "0", "-0", "1.5", "0.1", "3.5e-3", "1e10", "1E+3", ".5", "1.", "123456789012345678901", "0.000001", " 12", "-1.25e-7", "1e-320", "1e400"]:
		var v = DB.parse_gd_double(t)
		print("d|", t, "|", v == t.to_float(), "|", v, "|", t.to_float())

func ir_face():
	for text in ["1 + 2 * 3", "a.b(c)[d]", "not x and y or z", "x if c else y", "a ** b ** c", "-x ** 2", "f(1, g(2))", "(a)", "x is int", "&\"name\" + ^\"p/q\"", "$Node/Sub", "%Uniq", "\"s\"", "{}"]:
		var tree = SR.parse_source("var __v = " + text + "\n")
		var root = tree["rootNode"]
		var node = null
		for c in root["children"]:
			if c["type"] == "variable_statement":
				node = C.field(c, "value")
		if node == null:
			print("i|", text, "|NOVALUE")
			continue
		var idx = C.index_tree(root)
		print("i|", text, "|", JSON.stringify(LE.lower_expr(node, idx)))

func module_face():
	for text in SAMPLE_SOURCES:
		var tree = SR.parse_source(text)
		var m = LO.lower(tree)
		if m == null:
			print("mi|", text.replace("\n", "~n").replace("\t", "~t"), "|", JSON.stringify(LO.last_error))
		else:
			print("mi|", text.replace("\n", "~n").replace("\t", "~t"), "|", JSON.stringify(m))

func state_face():
	for text in ["Array[int]", "Dictionary[String, int]", "Array[Array[int]]", "Dictionary[a]", "int", "Array[int", "Dictionary[a, b, c]", "Dictionary[Vector2, Array[int]]"]:
		print("st|parse|", text, "|", JSON.stringify(AS.parse_typed(text)))
	var mm = LO.lower(SR.parse_source("var a = 1
signal s(b)
func f():
	pass
class C:
	pass
"))
	print("st|decl|", JSON.stringify(AS.decl_names(mm)))
	var r = AS.reset_run("own")
	print("st|keys|", AS.di_key(r, 3, 4), "|", AS.gv_key(r, "x", 3, 4), "|", AS.cap_key(r, 3, 4))
	var g = AS.new_scope(["gv", "gf"], null, true)
	var c = g.child(["cv"])
	var f = c.func_child(["lv"], false)
	var rows = ""
	for sc in [g, c, f]:
		rows += str(sc.has("gv")) + str(sc.has("lv")) + str(sc.has_local("gv")) + str(sc.has_local("lv")) + str(sc.allows_self()) + ","
	print("st|scope|", rows)

func fmt(v):
	if v is Dictionary:
		return "ERR:" + v["__error"]
	return v


func jk(v):
	if v == null:
		return "null"
	return v


func literal_face():
	var neg_zero = 0.0
	neg_zero = -neg_zero
	for v in [0.0, 1.0, -1.0, 1.5, 0.1, 1e300, 1e-300, 123456789012345680000.0, 3.141592653589793, 1e15, 1e16, 2.5e-8, 12345.6789, 0.000123456789012345]:
		print("lf|float|", str(v), "|", fmt(LF.float_text(v)), "|", fmt(LF.NF.str_num(v)), "|", fmt(LF.NF.str_sci(v)))
	print("lf|float|", str(neg_zero), "|", fmt(LF.float_text(neg_zero)), "|", fmt(LF.NF.str_num(neg_zero)), "|", fmt(LF.NF.str_sci(neg_zero)))
	for name in ["Array[Variant]", "Dictionary[Variant, Variant]", "Array[int]", "Dictionary[String, Array[Variant]]", "int", "Array[int", "Array[Array[int]]", " Dictionary[ String , int ] "]:
		print("lf|typed|", name, "|", LF.typed_face_text(name))
	print("lf|tok|", LF.dict_key_token({"t": "int", "v": 3}), "|", LF.dict_key_token({"t": "float", "v": 1.5}), "|", LF.dict_key_token({"t": "str", "v": "s"}), "|", LF.dict_key_token({"t": "bool", "v": true}), "|", LF.dict_key_token({"t": "bool", "v": false}), "|", LF.dict_key_token({"t": "null"}), "|", LF.dict_key_token({"t": "vec", "name": "Vector2", "xs": [1.0, 2.0]}), "|", LF.dict_key_token({"t": "np", "v": "A/B"}))
	print("lf|txt|", LF.dict_key_text({"t": "int", "v": 3}), "|", LF.dict_key_text({"t": "float", "v": 1.5}), "|", LF.dict_key_text({"t": "str", "v": "s"}), "|", LF.dict_key_text({"t": "bool", "v": true}), "|", LF.dict_key_text({"t": "null"}), "|", LF.dict_key_text({"t": "vec", "name": "Vector2", "xs": [1.0, 2.0]}), "|", LF.dict_key_text({"t": "np", "v": "A/B"}))
	print("lf|num|", LF.is_num("int"), "|", LF.is_num("float"), "|", LF.is_num("String"))
	for src in ["1", "-1", "-x", "1.5", "\"s\"", "true"]:
		var tree = SR.parse_source("var __v = " + src + "
")
		var node = null
		for c in tree["rootNode"]["children"]:
			if c["type"] == "variable_statement":
				node = C.field(c, "value")
		var ir = LE.lower_expr(node, C.index_tree(tree["rootNode"]))
		print("lf|expr|", src, "|", LF.is_negative_literal(ir), "|", jk(LF.numeric_literal_kind(ir)))
	var face_probes = [
		{"kind": "array", "items": [{"kind": "lit", "lit": "int", "value": 1}, {"kind": "lit", "lit": "int", "value": 2}]},
		{"kind": "array", "items": [{"kind": "lit", "lit": "int", "value": 1}, {"kind": "lit", "lit": "string", "value": "a"}]},
		{"kind": "dict", "entries": [{"key": {"kind": "lit", "lit": "int", "value": 1}, "value": {"kind": "lit", "lit": "int", "value": 2}}]},
		{"kind": "dict", "entries": [{"key": {"kind": "lit", "lit": "string", "value": "k"}, "value": {"kind": "lit", "lit": "int", "value": 2}}]},
		{"kind": "lit", "lit": "int", "value": 1},
	]
	var face_texts = []
	for e in face_probes:
		face_texts.append(LF.literal_face_text(e, "Variant"))
	hrow("lf|face", face_texts)
	for src in ["1", "-1", "\"s\"", "&\"s\"", "^\"/a\"", "null", "[1]", "{}", "Vector2(1, 2)", "Color(1, 0, 0)", "int(1)", "f(1)"]:
		var tree = SR.parse_source("var __v = " + src + "
")
		var node = null
		for c in tree["rootNode"]["children"]:
			if c["type"] == "variable_statement":
				node = C.field(c, "value")
		var ir = LE.lower_expr(node, C.index_tree(tree["rootNode"]))
		print("lf|opnd|", src, "|", jk(LF.non_numeric_literal(ir)), "|", LF.is_literal_operand(ir))


func dup_face():
	var i = 0
	for text in [
		"var d = {1: 1, 1: 2}",
		"var d = {0.0: 1, -0.0: 2}",
		"var d = {\"a\": 1, \"a\": 2}",
		"var d = {true: 1, false: 2}",
		"var d = {null: 1, null: 2}",
		"var d = {Vector2(1, 2): 1, Vector2(1, 2): 2}",
		"var d = {^\"A/B\": 1, NodePath(\"A/B\"): 2}",
		"var d = {1 + 2: 1, 3: 2}",
		"var d = {1 / 0: 1, 2: 2}",
		"func f():
	var d = {1: 1, 1: 2}
",
		"class C:
	var d = {\"x\": 1, \"x\": 2}
",
		"var d = {1: 1, 2: 1, 2: 2, 1: 3}",
	]:
		print("dup|", i, "|", text.replace("\n", "~n"))
		var tree = SR.parse_source(text + "
")
		var m = LO.lower(tree)
		if m != null:
			for d in MA.check_dict_duplicate_keys(m):
				print("dupdiag|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1


func hrow(label, vals):
	var out = label
	for v in vals:
		out += "|" + str(jk(v))
	print(out)


func unwrap_text(v):
	if v == null:
		return "null"
	return v["name"]


func helpers_face():
	hrow("hp|range", [HP.range_arg_list(["a"]), HP.range_arg_list(["a", null, "b"]), HP.range_arg_list([])])
	var call = {"kind": "call", "callee": {"kind": "ident", "name": "range"}, "args": [1]}
	hrow("hp|rangecall", [
		HP.is_range_call({"kind": "call", "callee": {"kind": "ident", "name": "range"}, "args": []}),
		HP.is_range_call(call),
		HP.is_range_call({"kind": "call", "callee": {"kind": "ident", "name": "range"}, "args": [1, 2, 3]}),
		HP.is_range_call({"kind": "call", "callee": {"kind": "ident", "name": "range"}, "args": [1, 2, 3, 4]}),
		HP.is_range_call({"kind": "call", "callee": {"kind": "ident", "name": "print"}, "args": [1]}),
		HP.is_range_call({"kind": "ident", "name": "range"}),
	])
	hrow("hp|base", [HP.basename_of_gd("a/b/c.gd"), HP.basename_of_gd("a\\b\\c.gd"), HP.basename_of_gd("c.gd"), HP.basename_of_gd(""), HP.basename_of_gd(null)])
	var types = [
		{"kind": "named", "name": "int"},
		{"kind": "named", "name": "float"},
		{"kind": "named", "name": "bool"},
		{"kind": "named", "name": "String"},
		{"kind": "named", "name": "StringName"},
		{"kind": "named", "name": "Array"},
		{"kind": "named", "name": "Dictionary"},
		{"kind": "named", "name": "Vector2"},
		{"kind": "named", "name": "Vector3"},
		{"kind": "named", "name": "Vector2i"},
		{"kind": "named", "name": "Vector3i"},
		{"kind": "named", "name": "Vector4"},
		{"kind": "named", "name": "Vector4i"},
		{"kind": "named", "name": "Transform2D"},
		{"kind": "named", "name": "Transform3D"},
		{"kind": "named", "name": "Quaternion"},
		{"kind": "named", "name": "Plane"},
		{"kind": "named", "name": "AABB"},
		{"kind": "named", "name": "Rect2"},
		{"kind": "named", "name": "Rect2i"},
		{"kind": "named", "name": "Basis"},
		{"kind": "named", "name": "Color"},
		{"kind": "named", "name": "PackedByteArray"},
		{"kind": "named", "name": "PackedInt32Array"},
		{"kind": "named", "name": "PackedInt64Array"},
		{"kind": "named", "name": "PackedFloat32Array"},
		{"kind": "named", "name": "PackedFloat64Array"},
		{"kind": "named", "name": "PackedStringArray"},
		{"kind": "named", "name": "PackedVector2Array"},
		{"kind": "named", "name": "PackedVector3Array"},
		{"kind": "named", "name": "PackedVector4Array"},
		{"kind": "named", "name": "PackedColorArray"},
		{"kind": "named", "name": "Foo"},
		{"kind": "named", "name": "Array[int]"},
		{"kind": "named", "name": "Dictionary[String, int]"},
		{"kind": "array"},
		{"kind": "inferred"},
		null,
	]
	var defaults = []
	for t in types:
		defaults.append(HP.type_default(t))
	hrow("hp|default", defaults)
	var ret = {"kind": "return", "value": {"kind": "lit", "lit": "int", "value": 1}}
	hrow("hp|hasret", [
		HP.has_value_return([]),
		HP.has_value_return([{"kind": "return", "value": null}]),
		HP.has_value_return([ret]),
		HP.has_value_return([{"kind": "if", "branches": [{"body": [ret]}]}]),
		HP.has_value_return([{"kind": "for", "body": [ret]}]),
		HP.has_value_return([{"kind": "match", "arms": [{"body": [ret]}]}]),
		HP.has_value_return([{"kind": "while", "body": [{"kind": "return", "value": null}]}]),
	])
	hrow("hp|typename", [HP.type_name({"kind": "named", "name": "int"}), HP.type_name({"kind": "array"}), HP.type_name({"kind": "inferred"})])
	CTX.ctx["CURRENT_MEMBERS"]["hp_a"] = true
	CTX.ctx["SCRIPT_BASE"]["MyScript"] = "Node"
	hrow("hp|unwrap", [
		unwrap_text(HP.unwrap_self_member({"kind": "attribute", "name": "hp_a", "obj": {"kind": "ident", "name": "self"}, "loc": {"line": 1}})),
		unwrap_text(HP.unwrap_self_member({"kind": "attribute", "name": "nope", "obj": {"kind": "ident", "name": "self"}, "loc": {"line": 1}})),
		unwrap_text(HP.unwrap_self_member({"kind": "attribute", "name": "hp_a", "obj": {"kind": "ident", "name": "o"}, "loc": {"line": 1}})),
		unwrap_text(HP.unwrap_self_member({"kind": "ident", "name": "x"})),
	])
	var anns = []
	for ann in [null, {"kind": "named", "name": "Array[int]"}, {"kind": "named", "name": "Dictionary[String, int]"}, {"kind": "named", "name": "Array[Array[int]]"}, {"kind": "named", "name": "Array[Object]"}, {"kind": "named", "name": "Array[MyScript]"}, {"kind": "named", "name": "Array[Foo]"}, {"kind": "named", "name": "Array[int"}, {"kind": "named", "name": "int"}, {"kind": "array"}]:
		anns.append(jk(HP.container_ann_text(ann)))
	hrow("hp|ann", anns)


func micro_face():
	var escape = []
	for p in ["\\u00e9", "\\u12", "\\U01F600", "\\x41", "\\x4", "\\o101", "\\o8", "\\n", "\\", "\r\n", "\\\r\n", "\\\r", "\\uZZZZ", "\\xzz"]:
		escape.append(L.escape_end(p, 0))
	hrow("mf|escape", escape)
	var i = 0
	for src in ["var x = 1\nfunc f(a):\n\treturn a\n", "a = 1 \\\n\t+ 2\n", "\n\n\n", "if x:\n\tpass\n"]:
		var lx = L.lex(src)
		var spans = I.group_lines(lx["tokens"])
		var out = ""
		for sp in spans:
			out += str(sp.row) + ":" + str(sp.indent) + ":" + str(sp.from) + ":" + str(sp.to) + ","
		print("mf|group|", i, "|", out)
		i += 1
	hrow("mf|static", [
		IRF.static_member_fn({"kind": "ident", "name": "Vector2"}),
		IRF.static_member_fn({"kind": "ident", "name": "Vector4i"}),
		IRF.static_member_fn({"kind": "ident", "name": "Color"}),
		IRF.static_member_fn({"kind": "ident", "name": "String"}),
		IRF.static_member_fn({"kind": "ident", "name": "Callable"}),
		IRF.static_member_fn({"kind": "ident", "name": "Node"}),
		IRF.static_member_fn({"kind": "call"}),
	])
	for base in [null, "Node", "Node2D", "Node3D", "Control", "Label"]:
		var keys = NF.node_self_props(base).keys()
		keys.sort()
		print("mf|props|", jk(base), "|", ", ".join(keys))


func scene_flat(node, prefix, out):
	out.append(prefix + ":" + node["cls"] + ":" + jk(node["script"]))
	for ch in node["children"]:
		scene_flat(ch, prefix + "/" + ch["name"], out)


func scene_face():
	var i = 0
	for text in [
		"[gd_scene format=3]\n\n[ext_resource type=\"Script\" path=\"res://main.gd\" id=\"1_a\"]\n\n[node name=\"Main\" type=\"Node2D\"]\nscript = ExtResource(\"1_a\")\n\n[node name=\"Body\" type=\"Sprite2D\" parent=\".\"]\n\n[node name=\"Arm\" type=\"Node2D\" parent=\"Body\"]\n",
		"[node name=\"A\" type=\"Node\"]\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\"]\n[node name=\"B\" type=\"Node\"]\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\" parent=\".\"]\n",
		"[gd_scene]\n[ext_resource type=\"Texture2D\" path=\"x\" id=\"1\"]\n",
		"[gd_scene]\n[sub_resource type=\"RectangleShape2D\" id=\"1\"]\n",
		"[gd_scene]\n[foo]\n",
		"[gd_scene]\n[node name=\"A\"]\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\" instance=ExtResource(\"1\")]\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\"]\nposition = Vector2(0, 0)\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\"]\nscript = ExtResource(\"9\")\n",
		"[gd_scene]\nscript = ExtResource(\"1\")\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\"]\n!!!\n",
		"[gd_scene]\n[node name=\"A\" type=\"Node\"]\n[node name=\"B\" type=\"Node\" parent=\"Ghost\"]\n",
		"[gd_scene]\n",
	]:
		var r = SC.parse_scene(text)
		if r.has("__error"):
			print("sc|", i, "|err|", r["__error"])
		else:
			var flat = []
			scene_flat(r["root"], ".", flat)
			print("sc|", i, "|ok|", ";".join(flat))
		i += 1


const WALK_SRC = "var mod_a = 1\nvar mod_b = 2\nvar obj = {\"k\": 3}\n\nfunc f(a, b):\n\tvar x = 1\n\tx = a + b\n\tfor i in range(3):\n\t\tx += i\n\tif x > 2:\n\t\tvar y = x\n\telse:\n\t\ty = 0\n\tmatch x:\n\t\t[1, 2]:\n\t\t\tx = 3\n\t\t{\"k\": q}:\n\t\t\tx = 4\n\t\t_:\n\t\t\tx = 5\n\treturn x\n\nfunc g():\n\tpass\n\nclass Base:\n\tvar bv = 1\n\nclass Child extends Base:\n\tvar cv = 2\n\n\tfunc h():\n\t\treturn cv\n"


func walk_face():
	var tree = SR.parse_source(WALK_SRC)
	var m = LO.lower(tree)
	if m == null:
		print("wb|parse-fail|", JSON.stringify(LO.last_error))
		return
	var assigned = WK.module_assigned_names(m).keys()
	assigned.sort()
	print("wb|assigned|", ", ".join(assigned))
	var f = m["funcs"][0]
	var flat = WK.flatten_body(f["body"])
	var kinds = []
	for n in flat:
		if n.get("kind") != null:
			kinds.append(n["kind"])
	kinds.sort()
	print("wb|flat|", flat.size(), "|", ", ".join(kinds))
	var locals = {}
	var pnames = []
	for p in f["params"]:
		pnames.append(p["name"])
	WK.collect_local_names(f["body"], pnames, locals)
	var lk = locals.keys()
	lk.sort()
	print("wb|locals|", ", ".join(lk))
	var ct = WK.class_table(m)
	var ck = ct.keys()
	ck.sort()
	print("wb|classes|", ", ".join(ck))
	for c in m["innerClasses"]:
		if c.get("extends") != null:
			print("wb|inherit|", c["name"], "|", ", ".join(WK.inherited_names(c, ct)))
	var grets = []
	for fn in m["funcs"]:
		grets.append(WK.guaranteed_return(fn["body"]))
	hrow("wb|gret", grets)
	hrow("wb|assign", [
		WK.assign_target_name({"kind": "ident", "name": "x"}),
		WK.assign_target_name({"kind": "attribute", "name": "p", "obj": {"kind": "ident", "name": "self"}}),
		WK.assign_target_name({"kind": "attribute", "name": "p", "obj": {"kind": "ident", "name": "o"}}),
		WK.assign_target_name({"kind": "index"}),
	])
	hrow("wb|bind", [
		", ".join(WK.pattern_bindings({"kind": "bind", "name": "a"})),
		", ".join(WK.pattern_bindings({"kind": "array", "items": [{"kind": "bind", "name": "a"}, {"kind": "wildcard"}]})),
		", ".join(WK.pattern_bindings({"kind": "dict", "entries": [{"pattern": {"kind": "bind", "name": "q"}}, {"pattern": {"kind": "bind", "name": "r"}}]})),
		", ".join(WK.pattern_bindings({"kind": "wildcard"})),
	])
	var bound = {"x": true}
	var reads = {}
	WK.collect_reads({"kind": "binary", "left": {"kind": "ident", "name": "x"}, "right": {"kind": "ident", "name": "y"}}, bound, reads)
	var rk = reads.keys()
	rk.sort()
	print("wb|reads|", ", ".join(rk))
	var ik = []
	WK.walk_expr_kinds({"kind": "binary", "left": {"kind": "is", "operand": {"kind": "ident", "name": "x"}}, "right": {"kind": "as", "operand": {"kind": "ident", "name": "y"}}, "loc": {"line": 1}}, ik)
	hrow("wb|ikinds", [ik.size()])


func slot_text(d):
	if d == null:
		return "null"
	return d["kind"] + ":" + d["decl"]


func pct_text(slots):
	var out = []
	for s in slots:
		if s["kind"] == "conv":
			out.append("c:" + s["ch"])
		elif s["kind"] == "star":
			out.append("*")
		else:
			out.append("tail")
	return ", ".join(out)


func slots_face():
	hrow("sl|coll", [SL.is_coll_text("Array[int]"), SL.is_coll_text("Dictionary[String, int]"), SL.is_coll_text("Array[Array[int]]"), SL.is_coll_text("int"), SL.is_coll_text("Array[]"), SL.is_coll_text("Array[int"), SL.is_coll_text("Color")])
	hrow("sl|scalar", [SL.scalar_source_name("int", {}), SL.scalar_source_name("Array[int]", {}), SL.scalar_source_name("Foo", {"Foo": true}), SL.scalar_source_name("Variant", {})])
	for kind in ["int", "bool", "String", "StringName", "Vector2", "Array", "Node"]:
		hrow("sl|hold|" + kind, [SL.can_hold(kind, "int"), SL.can_hold(kind, "Vector2i"), SL.can_hold(kind, "String"), SL.can_hold(kind, "null")])
	hrow("sl|varhold", [
		SL.var_slot_holds("int", "float"), SL.var_slot_holds("int", "String"), SL.var_slot_holds("int", "Vector2"),
		SL.var_slot_holds("float", "int"), SL.var_slot_holds("float", "null"), SL.var_slot_holds("bool", "int"),
		SL.var_slot_holds("bool", "String"), SL.var_slot_holds("String", "StringName"), SL.var_slot_holds("String", "int"),
		SL.var_slot_holds("Vector2", "Vector2i"), SL.var_slot_holds("StringName", "String"), SL.var_slot_holds("Other", "int"),
	])
	print("sl|dict|", slot_text(SL.dict_slot_of("Dictionary[String, int]")), "|", slot_text(SL.dict_slot_of("Dictionary")), "|", slot_text(SL.dict_slot_of("Array[int]")), "|", slot_text(SL.dict_slot_of("int")))
	hrow("sl|funcslot", [
		SL.func_slot_name({"kind": "named", "name": "int"}),
		SL.func_slot_name({"kind": "named", "name": "Vector2"}),
		SL.func_slot_name({"kind": "named", "name": "Rect2"}),
		SL.func_slot_name({"kind": "named", "name": "Foo"}),
		SL.func_slot_name(null),
		SL.func_slot_name({"kind": "array"}),
	])
	hrow("sl|intarg", [
		SL.literal_int_arg({"kind": "lit", "lit": "int", "value": 5}),
		SL.literal_int_arg({"kind": "unary", "op": "-", "operand": {"kind": "lit", "lit": "int", "value": 7}}),
		SL.literal_int_arg({"kind": "lit", "lit": "float", "value": 1.5}),
		SL.literal_int_arg({"kind": "ident", "name": "x"}),
	])
	for f in ["%s", "%d", "%*d", "%.3f", "%", "%%", "%c", "%-05v", "a%sb", "%5.2f", "%-+u*x"]:
		hrow("sl|pct|" + f, [pct_text(SL.pct_slots(f))])
	hrow("sl|nullref", [SL.null_refused_by_value_slot("int"), SL.null_refused_by_value_slot("Callable"), SL.null_refused_by_value_slot("Foo")])
	hrow("sl|objref", [SL.object_name_refused_by_value_slot("Callable", "int"), SL.object_name_refused_by_value_slot("Callable", "Foo"), SL.object_name_refused_by_value_slot(null, "int"), SL.object_name_refused_by_value_slot("Node", "Array")])
	var args = [
		{"kind": "lit", "lit": "int", "value": 5},
		{"kind": "unary", "op": "-", "operand": {"kind": "lit", "lit": "int", "value": 1}},
		{"kind": "lit", "lit": "float", "value": 1.5},
		{"kind": "lit", "lit": "string", "value": "a"},
		{"kind": "lit", "lit": "string", "value": "ab"},
		{"kind": "lit", "lit": "bool", "value": true},
		{"kind": "lit", "lit": "null"},
		{"kind": "unary", "op": "-", "operand": {"kind": "ident", "name": "x"}},
		{"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}, "args": []},
		{"kind": "call", "callee": {"kind": "ident", "name": "Color"}, "args": []},
		{"kind": "call", "callee": {"kind": "ident", "name": "f"}, "args": []},
		{"kind": "ident", "name": "x"},
	]
	var texts = []
	for a in args:
		texts.append(arg_text(SL.pct_arg(a)))
	hrow("sl|pctarg", texts)
	var arg_int = SL.pct_arg({"kind": "lit", "lit": "int", "value": 5})
	var arg_neg = SL.pct_arg({"kind": "unary", "op": "-", "operand": {"kind": "lit", "lit": "int", "value": 5}})
	var arg_one = SL.pct_arg({"kind": "lit", "lit": "string", "value": "a"})
	var arg_ab = SL.pct_arg({"kind": "lit", "lit": "string", "value": "ab"})
	var arg_vec = SL.pct_arg({"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}, "args": []})
	var pairs = [
		[{"kind": "tail"}, arg_int],
		[{"kind": "star"}, arg_int],
		[{"kind": "star"}, arg_ab],
		[{"kind": "conv", "ch": "s"}, arg_int],
		[{"kind": "conv", "ch": "c"}, arg_int],
		[{"kind": "conv", "ch": "c"}, arg_neg],
		[{"kind": "conv", "ch": "c"}, arg_one],
		[{"kind": "conv", "ch": "c"}, arg_ab],
		[{"kind": "conv", "ch": "v"}, arg_vec],
		[{"kind": "conv", "ch": "v"}, arg_int],
		[{"kind": "conv", "ch": "d"}, arg_int],
		[{"kind": "conv", "ch": "d"}, arg_ab],
		[{"kind": "conv", "ch": "q"}, arg_int],
	]
	var msgs = []
	for p in pairs:
		msgs.append(SL.pct_slot_message(p[0], p[1]))
	hrow("sl|pctmsg", msgs)
	var lit1 = {"kind": "lit", "lit": "int", "value": 1}
	var lit2 = {"kind": "lit", "lit": "int", "value": 2}
	var neg5 = {"kind": "unary", "op": "-", "operand": {"kind": "lit", "lit": "int", "value": 5}}
	var lit39 = {"kind": "lit", "lit": "int", "value": 39}
	var lit38 = {"kind": "lit", "lit": "int", "value": 38}
	var lit0 = {"kind": "lit", "lit": "int", "value": 0}
	var litf = {"kind": "lit", "lit": "float", "value": 1.5}
	var ident = {"kind": "ident", "name": "x"}
	var inst = []
	for pair in [[lit1, lit2], [lit1, neg5], [lit1, lit39], [lit1, lit38], [lit1, lit0], [litf, lit2], [lit1, ident], [lit1]]:
		inst.append(SL.instance_of_type_arg_message({"kind": "call", "args": pair}))
	hrow("sl|insty", inst)


func arg_text(d):
	if d == null:
		return "null"
	return str(d["num"]) + ":" + str(d["neg"]) + ":" + str(d["vec"]) + ":" + jk(d["text"])


func kind_tag(v):
	if v is Dictionary:
		return "dict"
	if v is Array:
		return "array"
	if v == null:
		return "null"
	if typeof(v) == TYPE_BOOL:
		return "bool"
	if typeof(v) == TYPE_INT:
		return "int"
	if typeof(v) == TYPE_STRING:
		return "str"
	return "other"


func context_face():
	var c = CTX.new_context()
	var keys = c.keys()
	keys.sort()
	for k in keys:
		print("cx|", k, "|", kind_tag(c[k]))
	hrow("cx|keys", [keys.size()])
	CTX.ctx["MODULE_VARS"]["x"] = true
	CTX.begin_emit({"mark": 1})
	hrow("cx|reset", [CTX.ctx["MODULE_VARS"].size(), CTX.analysis != null])


func faces_face():
	var reads = []
	for pair in [["Array[int]", null], ["Array[int]", "int"], ["Array[int]", "String"], ["Array[Foo]", null], ["Array[Foo]", "int"], ["Dictionary[String, int]", null], ["Dictionary[String, int]", "String"], ["Dictionary[String, int]", "int"], ["Dictionary[String, Foo]", null], ["int", null], ["Dictionary[String]", null]]:
		reads.append(jk(FC.read_face_of(pair[0], pair[1])))
	hrow("fc|read", reads)
	var holds = []
	for pair in [["int", "int"], ["int", "String"], ["String", "NodePath"], ["NodePath", "String"], ["Array", "int"], ["Vector2", "Vector2i"], ["Vector2", "String"], ["Foo", "int"]]:
		holds.append(FC.holds_param_default(pair[0], pair[1]))
	hrow("fc|hold", holds)
	var scalars = []
	for name in ["Array[int]", "Dictionary[String, int]", "int", "Color", "Foo", "Vector4"]:
		scalars.append(jk(FC.scalar_static_name(name)))
	hrow("fc|scalar", scalars)
	var statics = []
	for e in [{"kind": "lit", "lit": "int"}, {"kind": "lit", "lit": "string"}, {"kind": "lit", "lit": "string_name"}, {"kind": "lit", "lit": "null"}, {"kind": "array"}, {"kind": "dict"}, {"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}}, {"kind": "call", "callee": {"kind": "ident", "name": "int"}}, {"kind": "ident", "name": "x"}]:
		statics.append(jk(FC.static_type_name(e)))
	hrow("fc|static", statics)
	var bases = []
	for name in ["Array[int]", "Dictionary[String, int]", "int", "Array"]:
		bases.append(FC.arg_face_base(name))
	hrow("fc|base", bases)
	var names = []
	for t in [{"kind": "named", "name": "int"}, {"kind": "named", "name": "Array[int]"}, {"kind": "named", "name": "Dictionary[String, int]"}, {"kind": "named", "name": "Foo"}, {"kind": "named", "name": "Array[int"}, {"kind": "array"}, null]:
		names.append(jk(FC.arg_name_of(t)))
	hrow("fc|argname", names)
	var snv = {}
	FC.string_name_vars({"kind": "if", "branches": [{"body": [{"kind": "var", "name": "c", "type": {"kind": "named", "name": "StringName"}, "loc": {"line": 1}}]}]}, snv)
	FC.string_name_vars({"kind": "var", "name": "a", "type": {"kind": "named", "name": "StringName"}}, snv)
	FC.string_name_vars({"kind": "var", "name": "b", "type": {"kind": "named", "name": "int"}}, snv)
	var sk = snv.keys()
	sk.sort()
	print("fc|snv|", ", ".join(sk))
	var vta = []
	for t in [{"kind": "named", "name": "int"}, {"kind": "named", "name": "Vector2"}, {"kind": "named", "name": "Array"}, {"kind": "named", "name": "String"}, {"kind": "array"}, null]:
		vta.append(jk(FC.value_type_annotation(t)))
	hrow("fc|vta", vta)
	var lft = []
	for e in [{"kind": "lit", "lit": "string"}, {"kind": "lit", "lit": "int"}, {"kind": "array"}, {"kind": "dict"}, {"kind": "ident", "name": "x"}, {"kind": "ident", "name": "y"}]:
		lft.append(jk(FC.literal_face_type(e, {"x": "Foo"})))
	hrow("fc|lft", lft)
	var ltn = []
	for e in [{"kind": "lit", "lit": "int"}, {"kind": "lit", "lit": "float"}, {"kind": "lit", "lit": "bool"}, {"kind": "lit", "lit": "null"}, {"kind": "lit", "lit": "string"}, {"kind": "lit", "lit": "string_name"}, {"kind": "lit", "lit": "node_path"}, {"kind": "array"}, {"kind": "dict"}, {"kind": "lambda"}, {"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}}, {"kind": "call", "callee": {"kind": "ident", "name": "PackedByteArray"}}, {"kind": "call", "callee": {"kind": "ident", "name": "int"}}, {"kind": "ident", "name": "x"}, null]:
		ltn.append(jk(FC.literal_type_name(e)))
	hrow("fc|ltn", ltn)
	var cfk = []
	for face_name in ["Vector2", "String", "NodePath", "Color", "Object"]:
		cfk.append(FC.chain_face_known(face_name))
	hrow("fc|cfk", cfk)
	var kfa = []
	for t in [{"kind": "named", "name": "Vector2"}, {"kind": "named", "name": "Array[int]"}, {"kind": "named", "name": "PackedByteArray"}, {"kind": "named", "name": "Foo"}, {"kind": "named", "name": "int"}, {"kind": "array"}, null]:
		kfa.append(jk(FC.known_face_annotation(t)))
	hrow("fc|kfa", kfa)
	var pfr = []
	for obj in [{"kind": "ident", "name": "x"}, {"kind": "ident", "name": "y"}, {"kind": "call", "callee": {"kind": "ident", "name": "PackedByteArray"}}, {"kind": "call", "callee": {"kind": "ident", "name": "int"}}, null]:
		pfr.append(jk(FC.pack_face_recv(obj, {"x": "Vector2"})))
	hrow("fc|pfr", pfr)


func litint(v):
	return {"kind": "lit", "lit": "int", "value": v}


func litfloat(v):
	return {"kind": "lit", "lit": "float", "value": v}


func litstr(v):
	return {"kind": "lit", "lit": "string", "value": v}


func arr_of(items):
	return {"kind": "array", "items": items}


func abi_face():
	hrow("ab|stvarlit", [
		jk(AB.static_var_slots_literal("Cls", [{"name": "a", "isStatic": true}, {"name": "b", "isStatic": false}])),
		jk(AB.static_var_slots_literal("Cls", [{"name": "b", "isStatic": false}])),
	])
	hrow("ab|propslot", [
		jk(AB.prop_slot({"name": "x", "accessor": null})),
		jk(AB.prop_slot({"name": "y", "accessor": {"getter": null}, "init": litint(1)})),
		jk(AB.prop_slot({"name": "z", "accessor": {"getter": {"kind": "method"}}, "init": null})),
		jk(AB.prop_slot({"name": "w", "accessor": {"getter": {"kind": "method"}}, "init": litint(1)})),
	])
	var binds = AB.seed_param_binds([{"name": "p"}])
	AB.collect_binds({"kind": "for", "var": "i", "params": [{"name": "q"}], "body": [{"kind": "var", "name": "v"}, {"kind": "bind", "name": "w"}]}, binds)
	var bk = binds.keys()
	bk.sort()
	print("ab|binds|", ", ".join(bk))
	hrow("ab|slottype", [jk(AB.slot_type_name({"kind": "named", "name": "int"})), jk(AB.slot_type_name({"kind": "named", "name": "Vector2"})), jk(AB.slot_type_name({"kind": "named", "name": "Array"})), jk(AB.slot_type_name({"kind": "named", "name": "Foo"})), jk(AB.slot_type_name({"kind": "array"})), jk(AB.slot_type_name(null))])
	hrow("ab|rawts", [AB.raw_elem_ts("int"), AB.raw_elem_ts("int[]"), AB.raw_elem_ts("str[]"), AB.raw_elem_ts("float[]")])
	hrow("ab|scalarlit", [jk(AB.scalar_lit_kind(litint(1))), jk(AB.scalar_lit_kind(litfloat(1.5))), jk(AB.scalar_lit_kind(litstr("a"))), jk(AB.scalar_lit_kind({"kind": "lit", "lit": "bool", "value": true})), jk(AB.scalar_lit_kind({"kind": "lit", "lit": "null"})), jk(AB.scalar_lit_kind({"kind": "ident", "name": "x"}))])
	hrow("ab|elemkind", [
		jk(AB.elem_kind_from_init(arr_of([]))),
		jk(AB.elem_kind_from_init(arr_of([litint(1), litint(2)]))),
		jk(AB.elem_kind_from_init(arr_of([litint(1), litfloat(1.5)]))),
		jk(AB.elem_kind_from_init(arr_of([litstr("a")]))),
		jk(AB.elem_kind_from_init(arr_of([arr_of([litint(1)]), arr_of([litint(2)])]), true)),
		jk(AB.elem_kind_from_init(arr_of([arr_of([litint(1)]), arr_of([litstr("a")])]), true)),
		jk(AB.elem_kind_from_init(arr_of([{"kind": "ident", "name": "x"}]))),
	])
	hrow("ab|keykind", [AB.key_kind_ok("int"), AB.key_kind_ok("str"), AB.key_kind_ok("float"), AB.key_kind_ok("bool"), AB.key_kind_ok(null)])
	CTX.ctx["SCRIPT_BASE"]["MyScript"] = "Node"
	hrow("ab|slelem", [jk(AB.slot_elem_kind_name("int")), jk(AB.slot_elem_kind_name("Vector2")), jk(AB.slot_elem_kind_name("MyScript")), jk(AB.slot_elem_kind_name("Foo"))])
	hrow("ab|cont", [
		AB.container_slot("c", litint(1), null, "assignContainer"),
		AB.container_slot("c", arr_of([]), "Array[int]", "assignContainer"),
		AB.container_slot("c", {"kind": "dict"}, "Dictionary[String, int]", "returnContainer"),
		AB.container_slot("c", litint(1), "int", "returnContainer"),
	])
	hrow("ab|cast", [jk(AB.declared_cast({"kind": "named", "name": "int"})), jk(AB.declared_cast({"kind": "named", "name": "Vector2"})), jk(AB.declared_cast({"kind": "named", "name": "Array"})), jk(AB.declared_cast({"kind": "named", "name": "StringName"})), jk(AB.declared_cast({"kind": "named", "name": "Foo"})), jk(AB.declared_cast({"kind": "array"})), jk(AB.declared_cast(null))])
	hrow("ab|rawlit", [jk(AB.raw_int_lit(litint(5))), jk(AB.raw_int_lit(litfloat(1.5))), jk(AB.raw_int_lit({"kind": "ident", "name": "x"}))])
	hrow("ab|litfit", [
		AB.lit_binary_fits_raw({"kind": "binary", "op": "+", "left": litint(1), "right": litint(2)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "+", "left": litint(9007199254740991), "right": litint(1)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "-", "left": litint(9007199254740991), "right": litint(1)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "*", "left": litint(2), "right": litint(3)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "*", "left": litint(3037000500), "right": litint(3037000500)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "+", "left": litfloat(1.5), "right": litint(2)}),
		AB.lit_binary_fits_raw({"kind": "binary", "op": "/", "left": litint(9), "right": litint(3)}),
	])
	hrow("ab|formok", [
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [], "body": [{"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": true, "isStatic": false, "returnType": null, "params": [], "body": [{"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": false, "isStatic": true, "returnType": null, "params": [], "body": [{"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [], "body": []}),
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [{"type": {"kind": "named", "name": "int"}}], "body": [{"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [], "body": [{"kind": "var", "name": "v", "type": null}, {"kind": "assign", "target": {"kind": "ident", "name": "v"}}, {"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [], "body": [{"kind": "assign", "target": {"kind": "attribute", "name": "x", "obj": {"kind": "ident", "name": "self"}}}, {"kind": "return", "value": litint(1)}]}),
		AB.abi_form_ok({"coroutine": false, "isStatic": false, "returnType": null, "params": [], "body": [{"kind": "var", "name": "v", "type": null}]}),
	])
	hrow("ab|sameabis", [
		AB.same_abis({"f": {"ret": "int"}}, {"f": {"ret": "int"}}),
		AB.same_abis({"f": {"ret": "int"}}, {"f": {"ret": "float"}}),
		AB.same_abis({"f": {"ret": "int"}}, {}),
		AB.same_abis({}, {}),
	])


func layout_face():
	hrow("ly|sprops", [jk(LAY.script_props_literal([])), jk(LAY.script_props_literal([{"name": "a"}, {"name": "b"}]))])
	hrow("ly|sreader", [LAY.script_props_reader_literal("Cls", [{"name": "a"}, {"name": "b"}])])
	hrow("ly|ftypes", [
		jk(LAY.field_types_literal([{"name": "x", "type": {"kind": "named", "name": "int"}, "accessor": null}])),
		jk(LAY.field_types_literal([{"name": "q", "type": {"kind": "named", "name": "Foo"}, "accessor": {"getter": null}}])),
		jk(LAY.field_types_literal([{"name": "z", "type": null, "accessor": null}])),
		jk(LAY.field_types_literal([{"name": "x", "type": {"kind": "named", "name": "Vector2i"}, "accessor": null}, {"name": "w", "type": {"kind": "named", "name": "int"}, "accessor": {"getter": null}}, {"name": "e", "type": {"kind": "array"}}])),
	])
	var sn = LAY.static_names_literal([{"name": "f", "isStatic": true}, {"name": "g", "isStatic": false}])
	print("ly|snames|", ", ".join(sn))
	hrow("ly|fwd", [LAY.fwd_params([{"default": null}, {"default": litint(1)}], "a")])
	hrow("ly|svars", [
		jk(LAY.static_var_table_literal([{"name": "a", "isStatic": true, "type": {"kind": "named", "name": "int"}}, {"name": "b", "isStatic": false, "type": null}, {"name": "c", "isStatic": true, "type": null}])),
		jk(LAY.static_var_table_literal([{"name": "b", "isStatic": false, "type": null}])),
	])
	hrow("ly|dead", [
		LAY.has_dead_static_delegate({"vars": [{"isStatic": true, "accessor": {"getter": {"kind": "method", "method": "g"}, "setter": null}}], "funcs": [{"name": "g", "isStatic": true}], "innerClasses": []}),
		LAY.has_dead_static_delegate({"vars": [{"isStatic": true, "accessor": {"getter": {"kind": "method", "method": "h"}, "setter": null}}], "funcs": [{"name": "g", "isStatic": true}], "innerClasses": []}),
		LAY.has_dead_static_delegate({"vars": [], "funcs": [], "innerClasses": [{"vars": [{"isStatic": true, "accessor": {"getter": {"kind": "method", "method": "h"}, "setter": null}}], "funcs": [], "innerClasses": []}]}),
	])
	CTX.ctx["INNER_CLASSES"]["Base"] = {"name": "Base", "extends": null, "vars": [{"name": "bv", "isStatic": false}, {"name": "sv", "isStatic": true}], "signals": [{"name": "sig"}], "funcs": [{"name": "m", "isStatic": false}, {"name": "s", "isStatic": true}], "innerClasses": []}
	CTX.ctx["INNER_CLASSES"]["Child"] = {"name": "Child", "extends": "Base", "vars": [], "signals": [], "funcs": [], "innerClasses": []}
	print("ly|inhm|", ", ".join(LAY.inner_inherited_method_names(CTX.ctx["INNER_CLASSES"]["Child"])))
	print("ly|inhn|", ", ".join(LAY.inner_inherited_names(CTX.ctx["INNER_CLASSES"]["Child"])))
	var ordered = LAY.order_inner_classes([CTX.ctx["INNER_CLASSES"]["Child"], CTX.ctx["INNER_CLASSES"]["Base"]])
	var names = []
	for c in ordered:
		names.append(c["name"])
	print("ly|order|", ", ".join(names))
	hrow("ly|pnames", [
		", ".join(LAY.pattern_names({"kind": "bind", "name": "a"})),
		", ".join(LAY.pattern_names({"kind": "array", "items": [{"kind": "bind", "name": "a"}, {"kind": "wildcard"}]})),
		", ".join(LAY.pattern_names({"kind": "dict", "entries": [{"pattern": {"kind": "bind", "name": "q"}}, {"pattern": {"kind": "bind", "name": "r"}}]})),
		", ".join(LAY.pattern_names({"kind": "wildcard"})),
	])


func tab_text(t):
	return "null" if t == null else "table"


func dg_text(d):
	return "null" if d == null else d["message"]


func arity_face():
	var cf = []
	for t in ["Array", "String", "StringName", "NodePath", "Dictionary", "Foo"]:
		cf.append(tab_text(AR.class_face_arity(t)))
	hrow("ar|classface", cf)
	var lst = ["int", "String"]
	hrow("ar|listhas", [AR.face_list_has(lst, "int"), AR.face_list_has(lst, "String"), AR.face_list_has(lst, "Array[int]"), AR.face_list_has(lst, "Vector2")])
	var loc = {"line": 1}
	hrow("ar|diag", [
		dg_text(AR.arity_diag(AR.array_arity(), "array-arity", "append", 3, loc)),
		dg_text(AR.arity_diag(AR.array_arity(), "array-arity", "append", -1, loc)),
		dg_text(AR.arity_diag(AR.array_arity(), "array-arity", "has", 2, loc)),
		dg_text(AR.arity_diag(AR.array_arity(), "array-arity", "zzz", 1, loc)),
	])
	hrow("ar|memberabsent", [AR.member_name_absent("Array", "append"), AR.member_name_absent("Array", "nope"), AR.member_name_absent("Foo", "x")])
	var chain = []
	for face in ["String", "StringName", "NodePath", "Vector2", "Foo"]:
		var r = AR.chain_arity_face(face)
		chain.append(r["code"] + ":" + str(r["table"].size()))
	hrow("ar|chainface", chain)
	hrow("ar|managed", [AR.instance_face_managed("Array"), AR.instance_face_managed("Dictionary"), AR.instance_face_managed("Node"), AR.instance_face_managed("Foo"), AR.instance_face_managed("PackedByteArray")])
	hrow("ar|imabsent", [AR.instance_member_absent("Node", "get_name"), AR.instance_member_absent("Node", "nope"), AR.instance_member_absent("Array", "append"), AR.instance_member_absent("String", "nope"), AR.instance_member_absent("Foo", "x")])
	hrow("ar|babsent", [AR.builtin_instance_absent("Node", "get_name"), AR.builtin_instance_absent("Node", "nope"), AR.builtin_instance_absent("Foo", "x")])
	hrow("ar|fctor", [
		jk(AR.face_ctor_literal({"kind": "call", "callee": {"kind": "ident", "name": "StringName"}, "args": [litstr("x")]})),
		jk(AR.face_ctor_literal({"kind": "call", "callee": {"kind": "ident", "name": "NodePath"}, "args": [litstr("p")]})),
		jk(AR.face_ctor_literal({"kind": "call", "callee": {"kind": "ident", "name": "StringName"}, "args": [litint(1)]})),
		jk(AR.face_ctor_literal({"kind": "ident", "name": "StringName"})),
	])
	hrow("ar|barity", [jk(AR.builtin_arity("abs", 0)), jk(AR.builtin_arity("abs", 1)), jk(AR.builtin_arity("abs", 2)), jk(AR.builtin_arity("zzz", 1))])
	hrow("ar|uarity", [jk(AR.utility_arity("range", 0)), jk(AR.utility_arity("range", 1)), jk(AR.utility_arity("range", 4)), jk(AR.utility_arity("str", 0)), jk(AR.utility_arity("str", 3)), jk(AR.utility_arity("zzz", 1))])
	hrow("ar|code", [AR.builtin_arity_code("char"), AR.builtin_arity_code("var_to_str"), AR.builtin_arity_code("str_to_var"), AR.builtin_arity_code("convert"), AR.builtin_arity_code("type_convert"), AR.builtin_arity_code("range"), AR.builtin_arity_code("str"), AR.builtin_arity_code("print")])
	hrow("ar|vctor", [jk(AR.value_ctor_type({"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}})), jk(AR.value_ctor_type({"kind": "call", "callee": {"kind": "ident", "name": "int"}})), jk(AR.value_ctor_type({"kind": "ident", "name": "Vector2"}))])


func fn_face():
	var f = {"name": "f", "params": [{"name": "a", "type": {"kind": "named", "name": "int"}}, {"name": "b", "type": {"kind": "named", "name": "Foo"}}, {"name": "c", "type": null}]}
	hrow("fn|slots", [";".join(FN.emit_param_slots(f))])
	hrow("fn|frame", [jk(";".join(FN.frame_stmt_lines(null))), ";".join(FN.frame_stmt_lines({"line": 7}))])


func lines_text(lines):
	return "~".join(lines)


func class_face():
	var vars = [{"name": "x", "accessor": null, "isStatic": false}, {"name": "y", "accessor": {"getter": null}, "init": litint(1), "isStatic": false}, {"name": "s", "isStatic": true, "accessor": null}]
	hrow("cl|fd", [lines_text(CL.emit_field_declarations(vars, [{"name": "sig"}])), lines_text(CL.emit_field_declarations([], []))])
	hrow("cl|im", [lines_text(CL.emit_inner_mirrors([{"name": "A"}, {"name": "B"}])), lines_text(CL.emit_inner_mirrors([]))])
	var funcs = [{"name": "_init", "isStatic": false, "params": []}, {"name": "f", "isStatic": false, "params": [{"default": null}, {"default": litint(1)}]}, {"name": "s", "isStatic": true, "params": []}]
	hrow("cl|dispatch", [lines_text(CL.emit_dispatch(funcs, true)), lines_text(CL.emit_dispatch(funcs, false))])
	CTX.ctx["RAW_ABIS"]["g"] = {"params": ["int", "str"], "ret": "int"}
	hrow("cl|dispatch2", [lines_text(CL.emit_dispatch([{"name": "g", "isStatic": false, "params": [{}, {}]}], true))])
	hrow("cl|rc", [lines_text(CL.emit_root_constructor(true)), lines_text(CL.emit_root_constructor(false))])
	hrow("cl|foc", [lines_text(CL.emit_fields_only_constructor())])


func stype_face():
	var probes = [
		{"kind": "lit", "lit": "int"},
		{"kind": "lit", "lit": "float"},
		{"kind": "lit", "lit": "string"},
		{"kind": "lit", "lit": "string_name"},
		{"kind": "lit", "lit": "node_path"},
		{"kind": "lit", "lit": "bool"},
		{"kind": "lit", "lit": "null"},
		{"kind": "array"},
		{"kind": "dict"},
		{"kind": "unary", "op": "not", "operand": {"kind": "ident", "name": "x"}},
		{"kind": "unary", "op": "-", "operand": {"kind": "lit", "lit": "int", "value": 1}},
		{"kind": "unary", "op": "-", "operand": {"kind": "ident", "name": "x"}},
		{"kind": "binary", "op": "+", "left": {"kind": "lit", "lit": "int", "value": 1}, "right": {"kind": "lit", "lit": "int", "value": 2}},
		{"kind": "binary", "op": "+", "left": {"kind": "lit", "lit": "int", "value": 1}, "right": {"kind": "lit", "lit": "float", "value": 1.5}},
		{"kind": "binary", "op": "+", "left": {"kind": "lit", "lit": "string", "value": "a"}, "right": {"kind": "lit", "lit": "int", "value": 1}},
		{"kind": "binary", "op": "+", "left": {"kind": "array", "items": []}, "right": {"kind": "array", "items": []}},
		{"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}, "args": []},
		{"kind": "call", "callee": {"kind": "ident", "name": "int"}, "args": []},
		{"kind": "ident", "name": "x"},
	]
	var out = []
	for e in probes:
		out.append(jk(FC.static_type(e)))
	hrow("fc|stype", out)


func va_face():
	var i = 0
	for text in [
		"var a: int = 1\nvar b: int = \"s\"\n",
		"var a: int = 1\nfunc f():\n\ta = \"s\"\n",
		"var a: int = 1\nfunc f(x):\n\tvar y: int = \"s\"\n",
		"func f():\n\tprint(is_instance_of(1, 39))\n",
		"var a: Vector2 = Vector2(1, 2)\n",
		"class C:\n\tvar a: bool = 1\n",
		"var a: float = true\n",
	]:
		print("va|src|", i, "|", text.replace("\n", "~n"))
		var m = LO.lower(SR.parse_source(text + "\n"))
		if m != null:
			var diags = []
			VA.check_typed_var_assign(m, diags)
			for d in diags:
				print("vad|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1


func helpers2_face():
	hrow("h2|sih", [lines_text(HP.standalone_inline_header("a\nb").split("\n"))])
	hrow("h2|boxr", [HP.box_r({"rep": "int", "code": "x"}), HP.box_r({"rep": "float", "code": "x"}), HP.box_r({"rep": "str", "code": "x"}), HP.box_r({"rep": "bool", "code": "x"}), HP.box_r({"rep": "var", "code": "x"})])
	hrow("h2|fastsuffix", [HP.fast_suffix("int"), HP.fast_suffix("str[]"), HP.fast_suffix("float[]")])
	hrow("h2|closure", [
		HP.make_closure("Cls", null, true),
		HP.make_closure("Cls", {"params": []}, false),
		HP.make_closure("Cls", {"params": [{"default": null}, {"default": litint(1)}]}, false),
	])
	hrow("h2|maps", [
		HP.maps_equal({"a": 1}, {"a": 1}),
		HP.maps_equal({"a": 1}, {"a": 2}),
		HP.maps_equal({"a": 1}, {}),
		HP.maps_equal({}, {}),
	])
	CTX.ctx["DEBUG_FILE"] = "a.gd"
	hrow("h2|frame", [";".join(HP.frame_enter_lines("f")), ";".join(HP.frame_exit_lines(null)), ";".join(HP.frame_exit_lines("return rt.V.nil();"))])
	CTX.ctx["MODULE_FUNCS"]["a"] = true
	CTX.ctx["CLASS_VALUE_OWNERS"]["z"] = "Cls"
	hrow("h2|scope", [HP.callable_in_scope("a"), HP.callable_in_scope("b"), HP.callable_in_scope("z")])
	CTX.ctx["SCRIPT_BASE"]["MyScript"] = "Node"
	var raw = "rt.V.array(rt.GArray.of([]))"
	hrow("h2|stamp", [
		HP.stamp_decl({"kind": "named", "name": "Array[int]"}, raw, true, true),
		HP.stamp_decl({"kind": "named", "name": "Array[Object]"}, raw, true, false),
		HP.stamp_decl({"kind": "named", "name": "Array[MyScript]"}, raw, true, true),
		HP.stamp_decl({"kind": "named", "name": "Array[Foo]"}, raw, true, true),
		HP.stamp_decl({"kind": "named", "name": "Dictionary[String, int]"}, "rt.dictOf([])", true, true),
		HP.stamp_decl({"kind": "named", "name": "Dictionary[String, Foo]"}, "rt.dictOf([])", true, true),
		HP.stamp_decl({"kind": "named", "name": "Array[Array[int]]"}, raw, true, true),
		HP.stamp_decl({"kind": "named", "name": "int"}, "x", true, false),
		HP.stamp_decl(null, null, false, true),
	])


func faces3_face():
	var ann = {"x": "Array", "v": "Vector2"}
	var elems = {"e": "Array[int]"}
	var mods = {"y": "Vector2"}
	hrow("fc|attr", [
		jk(FC.attr_face_recv({"kind": "ident", "name": "x"}, ann, {}, mods)),
		jk(FC.attr_face_recv({"kind": "ident", "name": "x"}, {"x": "Dictionary"}, {}, {})),
		jk(FC.attr_face_recv({"kind": "ident", "name": "y"}, {}, {}, mods)),
		jk(FC.attr_face_recv({"kind": "array"}, {}, {}, {})),
		jk(FC.attr_face_recv({"kind": "lit", "lit": "string", "value": "s"}, {}, {}, {})),
		jk(FC.attr_face_recv({"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}, "args": []}, {}, {}, {})),
		jk(FC.attr_face_recv({"kind": "call", "callee": {"kind": "ident", "name": "int"}, "args": []}, {}, {}, {})),
		jk(FC.attr_face_recv({"kind": "index", "obj": {"kind": "ident", "name": "e"}, "index": {"kind": "lit", "lit": "int", "value": 1}}, {}, elems, {})),
		jk(FC.attr_face_recv({"kind": "attribute", "obj": {"kind": "ident", "name": "v"}, "name": "x"}, ann, {}, mods)),
		jk(FC.attr_face_recv({"kind": "lit", "lit": "string_name"}, {}, {}, {})),
		jk(FC.attr_face_recv({"kind": "lit", "lit": "node_path"}, {}, {}, {})),
		jk(FC.attr_face_recv(null, {}, {}, {})),
	])
	hrow("fc|chain", [
		jk(FC.chain_recv_face({"kind": "call", "callee": {"kind": "attribute", "obj": {"kind": "ident", "name": "a"}, "name": "front"}}, "Array")),
		jk(FC.chain_recv_face({"kind": "call", "callee": {"kind": "attribute", "obj": {"kind": "ident", "name": "a"}, "name": "front"}}, null)),
		jk(FC.chain_recv_face({"kind": "call", "callee": {"kind": "ident", "name": "f"}}, "Array")),
	])


func diag_text(arr):
	var out = []
	for d in arr:
		out.append(d["code"] + ":" + d["message"])
	return ";".join(out)


func static3_face():
	hrow("fc|sfcn", [FC.static_face_const_name("Vector2", "ZERO"), FC.static_face_const_name("Vector2", "from_angle"), FC.static_face_const_name("Vector2", "AXIS_X"), FC.static_face_const_name("Color", "red"), FC.static_face_const_name("Color", "NOPE"), FC.static_face_const_name("Foo", "ZERO")])
	hrow("ar|scall", [diag_text(AR.static_call_diags("Vector2", "ZERO", 0)), diag_text(AR.static_call_diags("Vector2", "AXIS_X", 0)), diag_text(AR.static_call_diags("Vector2", "from_angle", 1)), diag_text(AR.static_call_diags("Vector2", "from_angle", 2)), diag_text(AR.static_call_diags("Vector2", "angle", 0)), diag_text(AR.static_call_diags("Vector2", "zzz", 0)), diag_text(AR.static_call_diags("Foo", "zzz", 0))])
	hrow("ar|sbare", [diag_text(AR.static_bare_diags("Node", "new")), diag_text(AR.static_bare_diags("Node", "get_name")), diag_text(AR.static_bare_diags("Vector2", "ZERO")), diag_text(AR.static_bare_diags("Vector2", "zzz")), diag_text(AR.static_bare_diags("Foo", "new"))])


func faces4_face():
	var src = "var a: Array[int] = []\nvar b = [1]\nvar c = [1]\nfunc f(p: Array[int], q):\n\tvar d = [2]\n\tc = [3]\n\treturn d\nclass K:\n\tvar e: Array[int] = []\n\tfunc g():\n\t\tvar h = [4]\n"
	var m = LO.lower(SR.parse_source(src))
	hrow("fc|ant", [
		jk(FC.arg_name_type({"kind": "ident", "name": "x"}, {"x": "Vector2"})),
		jk(FC.arg_name_type({"kind": "ident", "name": "y"}, {"x": "Vector2"})),
		jk(FC.arg_name_type({"kind": "lit", "lit": "int"}, {})),
		jk(FC.arg_name_type(null, {})),
	])
	var parts = []
	for s in FC.arg_name_scopes(m):
		var ks = s["ann"].keys()
		ks.sort()
		var cells = []
		for k in ks:
			cells.append(k + "=" + s["ann"][k])
		parts.append(", ".join(cells))
	print("fc|anscopes|", ";".join(parts))
	var nodes = WK.flatten_body(m["funcs"][0]["body"])
	var names = FC.face_receiver_names(nodes, {"a": "annot", "b": "inferred"}, {}, "Array", "array")
	var nk = names.keys()
	nk.sort()
	print("fc|frecv|", ", ".join(nk))
	var texts = {}
	FC.face_receiver_names(nodes, {"a": "annot"}, {}, "Array", "array", true, texts)
	var tk = texts.keys()
	tk.sort()
	var tparts = []
	for k in tk:
		tparts.append(k + "=" + texts[k])
	print("fc|frecv2|", ", ".join(tparts))
	var fparts = []
	for s in FC.face_scopes(m, "Array", "array"):
		var sk = s["seeded"].keys()
		sk.sort()
		fparts.append(", ".join(sk))
	print("fc|fscope|", ";".join(fparts))


func pack4_face():
	hrow("sl|nappend", [jk(SL.named_append_source("x", {"x": "Array[int]"})), jk(SL.named_append_source("y", {"y": "Foo"})), jk(SL.named_append_source("z", {"z": "String"})), jk(SL.named_append_source(null, {}))])
	hrow("sl|nslot", [jk(SL.named_slot_source({"kind": "ident", "name": "x"}, {"x": "Array[int]"})), jk(SL.named_slot_source({"kind": "ident", "name": "y"}, {"y": "Foo"})), jk(SL.named_slot_source({"kind": "lit"}, {"x": "int"}))])
	hrow("sl|packsrc", [
		jk(SL.pack_arg_source(litint(1))),
		jk(SL.pack_arg_source(litfloat(1.5))),
		jk(SL.pack_arg_source(litstr("a"))),
		jk(SL.pack_arg_source(arr_of([]))),
		jk(SL.pack_arg_source({"kind": "dict"})),
		jk(SL.pack_arg_source({"kind": "call", "callee": {"kind": "ident", "name": "Vector2"}})),
		jk(SL.pack_arg_source({"kind": "call", "callee": {"kind": "ident", "name": "int"}})),
		jk(SL.pack_arg_source({"kind": "binary", "op": "+", "left": litstr("a"), "right": litstr("b")})),
		jk(SL.pack_arg_source({"kind": "binary", "op": "+", "left": litint(1), "right": litstr("b")})),
	])
	var m = LO.lower(SR.parse_source("var a: Array[int] = []\nfunc f(p: Array[int]):\n\tvar q: Vector2 = Vector2()\nclass K:\n\tvar e: String\n\tfunc g():\n\t\tpass\n"))
	var parts = []
	for s in SL.pack_arg_scopes(m):
		var ks = s["base"].keys()
		ks.sort()
		parts.append(", ".join(ks))
	print("sl|packscope|", ";".join(parts))


func pack5_face():
	var i = 0
	for text in [
		"var s: StringName = &\"x\"\nfunc f():\n\tif s is String:\n\t\tpass\n",
		"func f():\n\tvar b = [1] as PackedByteArray\n",
		"func f():\n\tvar c = \"s\" as PackedFloat32Array\n",
		"func f():\n\tif [1] is PackedByteArray:\n\t\tpass\n",
		"var a = PackedByteArray()\nfunc f():\n\ta.append(\"s\")\n\ta.append(1)\n\ta.append_array([1])\n\ta.set(0, \"s\")\n\ta.insert(\"s\", 1)\n\ta.fill(\"s\")\n",
	]:
		print("pk|src|", i, "|", text.replace("\n", "~n"))
		var m = LO.lower(SR.parse_source(text + "\n"))
		if m != null:
			var diags = []
			PK.check_pack_is_as(m, diags)
			PK.check_pack_arg_slots(m, diags)
			for d in diags:
				print("pkd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1


func attr_scope_face():
	var m = LO.lower(SR.parse_source("var a: Vector2 = Vector2()\nfunc f(p: int, q):\n\tvar r = a\nclass K:\n\tfunc g():\n\t\tpass\n"))
	var parts = []
	for s in FC.attr_scopes(m):
		var names = []
		for p in s["params"]:
			names.append(p["name"])
		parts.append(str(s["nodes"].size()) + ":" + ",".join(names))
	print("fc|attrscope|", ";".join(parts))


func slots6_face():
	hrow("sl|ctorname", [
		jk(SL.ctor_arg_name(litint(1), {})),
		jk(SL.ctor_arg_name({"kind": "ident", "name": "x"}, {"x": "Vector2"})),
		jk(SL.ctor_arg_name({"kind": "ident", "name": "TYPE_INT"}, {})),
		jk(SL.ctor_arg_name({"kind": "ident", "name": "TYPE_NOPE"}, {})),
		jk(SL.ctor_arg_name({"kind": "array"}, {})),
	])
	hrow("sl|namebad", [
		jk(SL.name_arg_bad({"kind": "ident", "name": "x"}, {"x": "Vector2"}, "String")),
		jk(SL.name_arg_bad({"kind": "ident", "name": "x"}, {"x": "int"}, "String")),
		jk(SL.name_arg_bad({"kind": "ident", "name": "x"}, {"x": "String"}, "String")),
		jk(SL.name_arg_bad({"kind": "ident", "name": "y"}, {"x": "Vector2"}, "String")),
	])


func slots7_face():
	var m = LO.lower(SR.parse_source("class A:\n\tclass B:\n\t\tpass\nclass C:\n\tpass\n"))
	var names = SL.class_slot_names(m, {"g1": true, "a": true})
	var ks = names.keys()
	ks.sort()
	print("sl|slotnames|", ", ".join(ks))


func home_face():
	hrow("hl|fnv", [HL.fnv1a(""), HL.fnv1a("a"), HL.fnv1a("abc"), HL.fnv1a("gds2js"), HL.fnv1a("中"), HL.fnv1a("😀")])


func typed_face():
	var i = 0
	for text in [
		"var a: Array[int] = [1, 2]\n",
		"var a: Array[int] = [\"s\"]\n",
		"var a: Array[Vector2] = [1]\n",
		"var d: Dictionary[String, int] = {\"k\": \"v\"}\n",
		"var a: Array[int] = \"s\"\n",
		"var a: Array[Array[int]] = []\n",
		"var a: Array[int] = [1]\nfunc f():\n\ta = [\"s\"]\n",
		"func f(p: Array[int]):\n\tpass\nfunc g():\n\tvar v: Array[String] = [\"s\"]\n\tf(v)\n",
		"var a: Array[float] = [1, 2.5]\n",
		"class K:\n\tvar a: Array[int] = [\"s\"]\n",
	]:
		print("ty|src|", i, "|", text.replace("\n", "~n"))
		var m = LO.lower(SR.parse_source(text + "\n"))
		if m != null:
			var diags = []
			TY.check_typed_collections(m, diags)
			for d in diags:
				print("tyd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1


func decls_face():
	var i = 0
	for text in [
		"var x:\n\tget:\n\t\treturn 1\n",
		"var x: int:\n\tget = get_x\n\tfunc get_x(a):\n\t\treturn a\n",
		"var x: int:\n\tget = get_x\n\tfunc get_x():\n\t\treturn 1\n",
		"func f() -> int:\n\treturn 1\n",
		"func f() -> int:\n\tif 1:\n\t\treturn 1\n",
		"func f() -> void:\n\tpass\n",
		"func f(a: int = \"s\"):\n\tpass\n",
		"func f(a: Vector2 = 1):\n\tpass\n",
		"func f(a: float = 1):\n\tpass\n",
		"signal s(a = 1)\n",
	]:
		print("dc|src|", i, "|", text.replace("\n", "~n"))
		var m = LO.lower(SR.parse_source(text + "\n"))
		if m != null:
			var diags = []
			DE.check_property_delegates(m, diags)
			DE.check_return_paths(m["funcs"], diags)
			DE.check_param_default_assign(m, diags)
			DE.check_signal_defaults(m, diags)
			for d in diags:
				print("dcd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func op_face():
	var i = 0
	for text in [
		"func f(a: void):
	pass
",
		"func f() -> void:
	pass
",
		"var a: bool = true
func f():
	if a <= true:
		pass
",
		"var a: int = 1
func f():
	print(\"%d\" % a)
",
		"func f():
	var x = 1.5 % 2
",
		"func f():
	var x = \"a\" == 1
",
		"func f():
	var x = 1 << -1
",
		"func f():
	var x = 1 / 0
",
		"func f():
	var a = [1]
	var x = a.append(2)
",
		"var c: Callable = Callable()
func f():
	var x = c.call(1, 2)
",
		"func f():
	var x = Vector2(1, 2) + 1
",
		"var s: String = \"a\"
func f():
	var t = s + 1
",
	]:
		print("op|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			OP.check_void_annotation(m, diags)
			OP.check_bool_ordering(m, diags)
			OP.check_percent_format(m, diags)
			OP.check_operand_pairs(m, diags)
			OP.check_void_method_values(m, diags)
			for nodes in WK.flatten_bodies(m):
				for n in nodes:
					if n.get("kind") == "binary":
						OP.check_operator(n, diags)
			for d in diags:
				print("opd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func meth_face():
	var i = 0
	for text in [
		"func f():
	var d = {}
	d.keys(1)
",
		"func f():
	var d: Dictionary = {}
	var x = d.nope()
",
		"func f():
	var a = []
	a.append()
",
		"func f():
	var a: Array = []
	a.nope()
",
		"func f():
	var a = []
	a.push_back(1, 2)
",
		"func f():
	var d = {}
	var x = d.merge({})
",
		"func f():
	var d: Dictionary[String, int] = {}
	var x = d.nope()
",
	]:
		print("ma|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			for d in MA.check_dict_method_arity(m):
				print("mad|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
			for d in MA.check_array_method_arity(m):
				print("mad|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func mark_face():
	var ctx = CTX.ctx
	ctx["LINE_MAPPINGS"] = []
	ctx["MAP_ACTIVE"] = false
	HP.mark(3, {"line": 5, "col": 2})
	print("mk|off|", ctx["LINE_MAPPINGS"].size())
	ctx["MAP_ACTIVE"] = true
	HP.mark(3, {"line": 5, "col": 2})
	HP.mark(7, null)
	var maps = ctx["LINE_MAPPINGS"]
	print("mk|on|", maps.size(), "|", maps[0]["genLine"], "|", maps[0]["srcLine"], "|", maps[0]["srcCol"])
	ctx["MAP_ACTIVE"] = false


func gconst_face():
	var i = 0
	for text in [
		"var x = PI
",
		"var x = PI + TAU
",
		"const PI = 1
func f():
	return PI
",
		"var PI = 2
func f():
	return PI + TAU
",
		"var f = func():
	return PI
",
		"class K:
	var PI = 1
	func f():
		return TAU
",
		"func f(c):
	return 1 if c else TAU
",
		"class K:
	class J:
		var TAU = 1
		func f():
			return INF
",
	]:
		print("hgc|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			for line in HP.global_const_lines(m, {}):
				print("hgl|", i, "|", line)
		i += 1

func _find_lambdas(n, out):
	if n is Array:
		for x in n:
			_find_lambdas(x, out)
		return
	if not (n is Dictionary):
		return
	if n.get("kind") == "lambda":
		out.append(n)
	for k in n.keys():
		if k == "loc":
			continue
		_find_lambdas(n[k], out)


func scope_face():
	var i = 0
	for text in [
		"var a = 1
func f():
	pass
class K:
	var b = 2
	signal s
	const C = 3
	func g():
		pass
",
		"class K:
	class J:
		var c = 1
",
	]:
		print("so|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			AS.reset_run("t")
			WK.seed_outer_names(m)
			var names = AS.get_run()["outerNames"].keys()
			names.sort()
			print("son|", i, "|", ",".join(names))
		i += 1
	var j = 0
	for text in [
		"var outer = 1
func f(p):
	var q = 2
	var lam = func(): return p + q
	return lam
",
		"func f():
	var z = 1
	var lam = func(a): return a + z + outer
",
		"func f():
	var q = 2
	var lam = func(): return q
	var lam2 = func(): return q + 1
",
	]:
		print("cp|src|", j, "|", text.replace("
", "~n"))
		var m2 = LO.lower(SR.parse_source(text + "
"))
		if m2 != null:
			AS.reset_run("t")
			WK.seed_outer_names(m2)
			for f in m2["funcs"]:
				var root = AS.Scope.make([], null)
				var names = ["self"]
				for p in f["params"]:
					names.append(p["name"])
				var fscope = root.func_child(names, true)
				var bound = {}
				WK.collect_local_names(f["body"], names, bound)
				for k in bound.keys():
					fscope.declare(k)
				var lams = []
				_find_lambdas(f["body"], lams)
				for lam in lams:
					WK.record_captures(lam, fscope)
			var caps = AS.get_run()["lambdaCaptures"]
			var keys = caps.keys()
			keys.sort()
			for k in keys:
				print("cpr|", j, "|", k, "|", ",".join(caps[k]))
		j += 1

func sc_face():
	var i = 0
	for text in [
		"class K:
	pass
var a: K = 1
",
		"class K:
	pass
func f(a: K = 1):
	pass
",
		"class K:
	pass
func f():
	var v: K = \"s\"
",
		"class K:
	var a: K = 1
",
		"class K:
	func g(a: K = \"s\"):
		pass
",
		"class K:
	pass
var a: K = null
",
		"class K:
	class J:
		var a: J = 1
",
	]:
		print("sc|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			DE.check_script_class_slots(m, diags)
			for d in diags:
				print("scd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func ca_face():
	var i = 0
	for text in [
		"const A = 1
func f():
	A = 2
",
		"const A = 1
func f():
	var A = 2
	A = 3
",
		"func f():
	PI = 1
",
		"func f():
	print = 1
",
		"func f():
	Node = 1
",
		"func f():
	var lam = func():
		PI = 1
",
		"class K:
	const B = 1
	func g():
		B = 2
",
		"const C = 1
func f():
	var v = func():
		C = 2
",
	]:
		print("ca|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			DE.check_const_assign(m, diags, {})
			for d in diags:
				print("cad|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func ic_face():
	var i = 0
	for text in [
		"class K:
	func _init():
		return 1
",
		"class K:
	func _init():
		super()
",
		"class A:
	func _init():
		pass
class B extends A:
	func _init():
		super()
",
		"class A:
	func _init(x):
		pass
class B extends A:
	func _init():
		super()
",
		"class A:
	func _init(x = 1):
		pass
class B extends A:
	func _init():
		super()
",
		"class A:
	func _init(x):
		pass
func f():
	var a = A.new()
",
		"class A:
	func _init(x):
		pass
func f():
	var a = A.new(1, 2)
",
	]:
		print("ic|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			DE.check_init_contracts(m, {}, diags)
			for d in diags:
				print("icd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func cfv_face():
	var i = 0
	for text in [
		"func helper():
	pass
class K:
	func g():
		helper()
",
		"func helper():
	pass
class K:
	func helper():
		pass
	func g():
		helper()
",
		"func helper():
	pass
class K:
	func g():
		var helper = 1
		helper()
",
		"func helper():
	pass
class K:
	func g(helper):
		helper()
",
		"func helper():
	pass
class K:
	func g():
		var f = func():
			helper()
",
		"func helper():
	pass
class K:
	class J:
		func g():
			helper()
",
		"func helper():
	pass
class K:
	var v = helper()
",
		"func helper():
	pass
class K:
	var v:
		get:
			return helper()
",
		"class K:
	func g():
		helper()
",
	]:
		print("cfv|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			DE.check_class_func_visibility(m, diags)
			for d in diags:
				print("cfvd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func faces5_face():
	var sn = {"type": "StringName"}
	var np = {"type": "NodePath", "ctorRecv": true}
	var i = 0
	for text in ["&\"x\"", "^\"x\"", "NodePath(\"x\")", "&\"a\" + &\"b\"", "\"s\"", "StringName(\"x\")"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		var a = false
		var b = false
		if node != null:
			a = FC.ctor_recv_face(node, sn)
			b = FC.ctor_recv_face(node, np)
		print("cr|", i, "|", a, "|", b)
		i += 1
	var j = 0
	for text in [
		"func f():
	var q = 2
	var lam = func(): return q
",
		"func f():
	var lam = func(a): return a
",
	]:
		print("lcn|src|", j, "|", text.replace("
", "~n"))
		var m2 = LO.lower(SR.parse_source(text + "
"))
		if m2 != null:
			AS.reset_run("t")
			WK.seed_outer_names(m2)
			for f in m2["funcs"]:
				var root = AS.Scope.make([], null)
				var names = ["self"]
				for p in f["params"]:
					names.append(p["name"])
				var fscope = root.func_child(names, true)
				var bound = {}
				WK.collect_local_names(f["body"], names, bound)
				for k in bound.keys():
					fscope.declare(k)
				var lams = []
				_find_lambdas(f["body"], lams)
				for lam in lams:
					WK.record_captures(lam, fscope)
					var caps = FC.lambda_capture_names(lam)
					print("lcn|", j, "|", lam["loc"]["line"], "|", ",".join(caps))
		j += 1

func calls_face():
	var i = 0
	for text in [
		"func f():
	var x = String(1)
",
		"var a: int = 1
func f():
	var x = String(a)
",
		"func f():
	var x = String(1.0)
",
		"func f(a):
	var x = String(a)
",
		"func String():
	pass
func f():
	var x = String(1)
",
		"func f():
	var x = Vector2(1, 2)
",
		"func f():
	var s = \"a\".join()
",
		"func f():
	var s = \"a\".join(\",\", 1)
",
		"func f():
	var d = {}
	var s = d.join(\",\")
",
		"func f():
	var s = \"a\".join({})
",
		"func f():
	var x = bool([1])
",
		"func f():
	var x = bool(1)
",
		"var v = 1
static func s():
	return v
",
		"func h():
	pass
static func s():
	h()
",
		"func h():
	pass
static var sv = h()
",
		"var v = 1
static func s():
	var v = 2
	return v
",
	]:
		print("cl|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			CA.check_static_access(m["funcs"], m["vars"], diags)
			CA.check_ctor_signatures(m, diags)
			for nodes in WK.flatten_bodies(m):
				for n in nodes:
					if n.get("kind") == "call":
						var callee = n["callee"]
						if callee.get("kind") == "ident":
							CA.check_call(callee.get("name"), n, diags)
						elif callee.get("kind") == "attribute":
							CA.check_method_call(callee.get("name"), n, diags)
			for d in diags:
				print("cld|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func sma_face():
	var i = 0
	for text in [
		"func f():
	var s = \"a\"
	s.substr(1, 2, 3)
",
		"func f():
	\"a\".nope()
",
		"var s: String = \"a\"
func f():
	var x = s.substr(1, 2, 3)
",
		"func f():
	var a: Array[String] = [\"x\"]
	var x = a[0].substr(1, 2, 3)
",
		"func f():
	var s = \"a\"
	s.replace(\"a\", \"b\")
",
		"var s: String = \"a\"
func f():
	var x = s.nope()
",
	]:
		print("sm|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			CA.check_string_method_arity(m, diags)
			for d in diags:
				print("smd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func cfa_face():
	var i = 0
	for text in ["\"s\".split(1)", "\"s\".split(\"n\", 2)", "\"s\".split(\"n\", true, 3)", "\"s\".split(\"n\", \"d\", 1)", "\"s\".substr(\"x\")"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		if node == null:
			print("cfa|", i, "|NODE")
			i += 1
			continue
		var method = "substr" if text.begins_with("\"s\".substr") else "split"
		for d in SL.class_face_arg_diags(node, "String", method, {}):
			print("cfa|", i, "|", d["code"], "|", d["message"])
		print("cfa|", i, "|END")
		i += 1

func nf_face():
	var sn = {"type": "StringName", "lit": "string_name", "arity": T.STRING_NAME_ARITY, "arityCode": "string-name-arity"}
	var np = {"type": "NodePath", "lit": "node_path", "arity": T.NODE_PATH_ARITY, "arityCode": "node-path-arity"}
	var i = 0
	for text in [
		"func f():
	var s: StringName = &\"a\"
	s.substr(1, 2, 3)
",
		"func f():
	var s = &\"a\"
	s.split(1)
",
		"func f():
	var s = ^\"a\"
	s.split(1)
",
		"func f():
	var s = NodePath(\"a\")
	s.substr(1, 2, 3)
",
		"func f():
	\"a\".substr(1, 2, 3)
",
		"var s: StringName = &\"a\"
func f():
	s.substr(1)
",
	]:
		print("nf|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			for pair in [["StringName", sn], ["NodePath", np]]:
				var diags = []
				CA.check_named_face(m, pair[1], diags)
				for d in diags:
					print("nfd|", i, "|", pair[0], "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func fas_face():
	var i = 0
	for text in [
		"func f(p: int):
	pass
func g():
	f(\"s\")
",
		"func f(p: int):
	pass
func g():
	f(1)
",
		"class K:
	func m(p: int):
		pass
	func g():
		self.m(\"s\")
",
		"class K:
	pass
func g(a: K):
	pass
func h():
	g(1)
",
		"func f(p: int):
	pass
func g():
	f()
",
		"class A:
	func m(p: int):
		pass
class B extends A:
	func g():
		self.m(\"s\")
",
	]:
		print("fas|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			CA.check_func_arg_slots(m, {}, diags)
			for d in diags:
				print("fasd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func _lay2_funcs(m):
	if not m["funcs"].is_empty():
		return m["funcs"]
	var list = m["innerClasses"]
	while not list.is_empty():
		var c = list[0]
		if not c["funcs"].is_empty():
			return c["funcs"]
		list = c["innerClasses"]
	return []


func _lay2_class_name(m):
	if m.get("className") != null:
		return m["className"]
	if not m["innerClasses"].is_empty():
		return m["innerClasses"][0]["name"]
	return "M"


func _lay2_text(v):
	return "null" if v == null else v


func lay2_face():
	var i = 0
	for text in [
		"class K:
	static func s(a, b):
		pass
	func _init(x, y = 1):
		pass
	func m(p: int, q):
		pass
",
		"func f():
	var a = 1
	var b: int = 2
	if a:
		var c: String = \"x\"
",
		"class A:
	pass
class B extends A:
	pass
class C extends Node:
	pass
",
	]:
		print("lay2|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var funcs = _lay2_funcs(m)
			var cname = _lay2_class_name(m)
			print("lay2|", i, "|statics|", LAY.statics_table_literal(cname, funcs))
			print("lay2|", i, "|methods|", _lay2_text(LAY.method_arities_literal(funcs)))
			print("lay2|", i, "|ctors|", _lay2_text(LAY.ctor_arities_literal(funcs)))
			print("lay2|", i, "|params|", _lay2_text(LAY.method_params_literal(funcs)))
			var out = {}
			var untyped = []
			for f in funcs:
				LAY.collect_local_types(f["body"], out, untyped)
			var keys = out.keys()
			keys.sort()
			for k in keys:
				var t = out[k]
				var tn = null
				if t != null and t.get("kind") == "named":
					tn = t["name"]
				print("lay2|", i, "|localv|", k, "|", tn)
			var un = untyped.duplicate()
			un.sort()
			print("lay2|", i, "|untyped|", ",".join(un))
			var base = {}
			for c in m["innerClasses"]:
				LAY.collect_script_base(c, base)
			var bk = base.keys()
			bk.sort()
			for k in bk:
				print("lay2|", i, "|base|", k, "|", base[k])
		i += 1

func abi3_face():
	CTX.ctx["RAW_ABIS"] = {}
	var ids = {"x": "int", "y": "float", "s": "str"}
	var arrays = {"a": "int", "g": "int[]"}
	var dict = {"d": "int"}
	var i = 0
	for text in ["1 + 2", "1.5 + 2", "x + y", "x * 2", "x < y", "x < 2", "s + \"a\"", "-x", "a[0]", "g[1][2]", "d[0]", "d[\"k\"]", "a.size()", "d.get(0, 1)", "b"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		var k = null
		if node != null:
			k = AB.kind_of_expr(node, ids, arrays, dict)
		print("k|", i, "|", _lay2_text(k))
		i += 1

func lay3_face():
	CTX.ctx["INNER_CLASSES"] = {"K": true}
	for name in ["K", "RefCounted", "Object", "Node", "Other"]:
		var r = LAY.inner_class_base(name)
		if r is Dictionary:
			print("ib|", name, "|__error|", r["__error"])
		elif r == null:
			print("ib|", name, "|null")
		else:
			print("ib|", name, "|", r)
	CTX.ctx["UNTYPED_NAMES"] = {"u": true}
	CTX.ctx["LOCAL_TYPES"] = {"a": {"kind": "named", "name": "int"}, "b": null, "c": {"kind": "named", "name": "Variant"}, "d": {"kind": "named", "name": "Array"}}
	CTX.ctx["VAR_TYPES"] = {"v": {"kind": "named", "name": "float"}}
	CTX.ctx["FUNC_RETURNS"] = {"f": {"kind": "named", "name": "int"}, "g": null, "h": {"kind": "named", "name": "Variant"}}
	var i = 0
	for text in ["u", "a", "b", "c", "d", "v", "zz", "f()", "g()", "h()", "d[0]", "a[0]", "obj.x"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		var val = true
		if node != null:
			val = LAY.pct_static_side(node)
		print("ps|", i, "|", val)
		i += 1

func ida_face():
	var ids = {"x": "int", "y": "int"}
	var i = 0
	for text in ["x / 2", "x / 0", "x / y", "x + 1", "-x / 0"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		var v = false
		if node != null:
			v = HP.int_div_may_abort(node, ids)
		print("ida|", i, "|", v)
		i += 1
	var j = 0
	for text in [
		"func add(a, b):
	return a + b
",
		"func add(a, b):
	return a + b
func g():
	return add(1, 2)
",
		"func add(a, b):
	return a + b
func g():
	return add(1.5, 2)
",
		"func add(a, b):
	var s = 0
	s = a
	return s
",
		"func add(a, b):
	return a / 0
",
	]:
		var m2 = LO.lower(SR.parse_source(text + "
"))
		if m2 == null:
			print("sv|", j, "|null")
			j += 1
			continue
		var f = m2["funcs"][0]
		var sites = []
		for other in m2["funcs"]:
			var bodies = WK.flatten_bodies({"funcs": [other], "innerClasses": []})
			for nodes in bodies:
				for n in nodes:
					if n.get("kind") == "call" and n["callee"].get("kind") == "ident" and n["callee"].get("name") == f["name"]:
						sites.append({"args": n["args"], "owner": other})
		print("sv|", j, "|", HP.sig_valid(f, "int", sites, {}))
		j += 1

func walk2_face():
	var i = 0
	for text in [
		"func f():
	return zzz
",
		"func f():
	var a = 1
	return a
",
		"static func s():
	return self
",
		"func f():
	break
",
		"func f():
	var a = 1 + \"s\"
",
		"func f():
	print(pow(1, \"x\"))
",
		"class K:
	static func s():
		pass
func f():
	K.s()
",
		"func f():
	var x = 5
	if x:
		print(zz)
",
		"func f():
	var a = 1
	for i in [1]:
		break
",
	]:
		print("wk|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			AS.reset_run("t")
			WK.seed_outer_names(m)
			WK.mark_class_face_receivers(m)
			var diags = []
			var root = AS.Scope.make([], null)
			for f in m["funcs"]:
				WK.check_func(f, root, {}, diags)
			for d in diags:
				print("wkd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func cls_face():
	var i = 0
	for text in [
		"class K:
	var a = 1
	func f():
		return a
",
		"class K:
	static var s = 1
	var a = s
",
		"class K:
	var a = self.b
",
		"class K:
	var a = zzz
",
		"class K:
	var a:
		get:
			return 1
",
		"class K:
	static func s():
		pass
	var a = s()
",
	]:
		print("cls|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			AS.reset_run("t")
			WK.seed_outer_names(m)
			WK.mark_class_face_receivers(m)
			var diags = []
			var classes = WK.class_table(m)
			var root = AS.Scope.make([], null)
			for c in m["innerClasses"]:
				DE.check_class(c, root, diags, classes)
			for d in diags:
				print("clsd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func ix_face():
	var i = 0
	for text in [
		"var a: Array[int] = [1]
func f():
	var x = a[\"s\"]
",
		"var d: Dictionary[String, int] = {}
func f():
	var x = d[\"k\"]
",
		"var d: Dictionary[String, int] = {}
func f():
	d[\"k\"] = \"v\"
",
		"var a: Array[int] = [1]
func f():
	a[\"s\"] = 1
",
		"func f():
	var a = [1]
	var x = a[\"s\"]
",
		"func f():
	var x = [\"a\"][\"s\"]
",
	]:
		print("ix|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			AS.reset_run("t")
			var diags = []
			IX.check_typed_index_slots(m, diags)
			for d in diags:
				print("ixd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func vm_face():
	var i = 0
	for text in [
		"func f():
	var x = pow(1)
",
		"func f():
	var x = abs(\"s\")
",
		"func f():
	var x = Vector2(1, 2).bogus()
",
		"var v = Vector2(1, 2)
func f():
	var x = v.lerp(\"s\", 0.5)
",
		"func f():
	var x = Vector2.ZERO()
",
		"func f():
	var x = Vector2.nope()
",
		"func f():
	var x = char(4294967296)
",
		"func f():
	var x = String(1)
",
	]:
		print("vm|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var diags = []
			CA.check_value_method_arity(m, diags)
			for d in diags:
				print("vmd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func pk6_face():
	var i = 0
	for text in [
		"func f(p: PackedByteArray):
	p.nope()
",
		"func f():
	var s: StringName = &\"a\"
	s.nope()
",
		"func f(p: PackedByteArray):
	var x = p.nope
",
		"var a: Array[int] = []
func f():
	var x = a.new()
",
		"func f(p: PackedByteArray):
	p.size = 1
",
	]:
		print("pk6|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			AS.reset_run("t")
			var diags = []
			PK.check_pack_face_names(m, diags)
			for d in diags:
				print("pk6d|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func az_face():
	var i = 0
	for text in [
		"var a: Array[int] = [\"s\"]
func f():
	return zzz
",
		"const A = 1
func f():
	A = 2
",
		"extends SceneTree
func f():
	call_deferred(\"x\")
",
		"func f():
	var q = 1
	var g = func(): return q
",
		"class K:
	var a = zzz
",
		"func f():
	var x = pow(1)
",
		"func f(p: PackedByteArray):
	p.nope()
",
		"var d: Dictionary[String, int] = {}
func f():
	d[\"k\"] = \"v\"
",
	]:
		print("az|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			var r = AZ.analyze(m, {}, "t")
			for d in r["diagnostics"]:
				print("azd|", i, "|", d["code"], "|", d["loc"]["line"], "|", d["message"])
		i += 1

func di_face():
	var i = 0
	for text in [
		"var a = 1
var b = 2
",
		"var a = 1
const C = 2
static var s = 3
",
		"var v: int:
	get:
		return 1
",
	]:
		print("di|src|", i, "|", text.replace("
", "~n"))
		var m = LO.lower(SR.parse_source(text + "
"))
		if m != null:
			CTX.ctx["MODULE_RES_PATH"] = null
			print("di|", i, "|null|", LAY.dict_identity_literal("__d", "C:/proj/main.gd", m["vars"], "Main"))
			CTX.ctx["MODULE_RES_PATH"] = "C:/proj/main.gd"
			print("di|", i, "|set|", LAY.dict_identity_literal("__d", "C:/proj/main.gd", m["vars"], "Main"))
		i += 1

func el_face():
	var i = 0
	for text in ["42", "9007199254740993", "1.5", "\"a\\\"b\"", "&\"x\"", "^\"p/q\"", "true", "null"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = null
		if m != null:
			node = m["vars"][0].get("init")
		if node == null:
			print("el|", i, "|NODE")
		else:
			print("el|", i, "|", EB.emit_lit(node["lit"], node.get("value")))
		i += 1

func ex_face():
	CTX.begin_emit(null)
	var i = 0
	for text in ["1", "1.5", "\"s\"", "true", "-1", "1 if true else 2", "[1, 2]", "{1: 2}", "not true"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = m["vars"][0].get("init")
		var r = EB.emit_expr_r(node)
		print("ex|", i, "|", r["code"], "|", r["rep"])
		i += 1
	var j = 0
	for text in ["x = 5", "a[0] = 5", "self.x = 5"]:
		var m2 = LO.lower(SR.parse_source("func f():
	" + text + "
"))
		var st = m2["funcs"][0]["body"][0]
		print("as|", j, "|", EB.emit_assign(st["target"], "5"))
		j += 1

func bc_face():
	var names = BT.COUNT.keys()
	names.sort()
	for n in names:
		var cnt = BT.COUNT[n]
		var k = 3 if cnt < 0 else cnt
		var args = []
		for i in k:
			args.append("A" + str(i))
		print("bf|", n, "|", CALL.builtin_emit(n, args))
	var i = 0
	for text in ["1 + 2", "\"a\" + \"b\"", "1 % 2", "x in y", "a and b", "a or b", "1 << 2"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = m["vars"][0].get("init")
		print("bn|", i, "|", CALL.emit_binary(node))
		i += 1
	var j = 0
	for text in ["print(1)", "pow(1, 2)", "len([1])", "sqrt(2)"]:
		var m2 = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node2 = m2["vars"][0].get("init")
		print("bcl|", j, "|", CALL.emit_call(node2))
		j += 1

func st_face():
	CTX.begin_emit(null)
	var i = 0
	for text in ["var a = 1", "a = 1", "print(1)", "if true:
		pass", "for i in [1, 2]:
		pass", "while true:
		break", "return 1", "match 1:
		1:
			pass"]:
		var m = LO.lower(SR.parse_source("func f():
	" + text + "
"))
		if m == null or m["funcs"].is_empty():
			print("stm|", i, "|NODE")
			i += 1
			continue
		var body = m["funcs"][0]["body"]
		var st = body[0] if body.size() > 0 else null
		if st == null:
			print("stm|", i, "|NODE")
		else:
			print("stm|", i, "|", JSON.stringify(ES.emit_stmt(st, false)))
		i += 1

func _fl_map(m):
	var keys = m.keys()
	keys.sort()
	var out = {}
	for k in keys:
		out[k] = m[k]
	return out


func fl_face():
	var i = 0
	for text in [
		"func f():
	var a = [1, 2]
	a.append(3)
	var x = a[0]
",
		"func f():
	var d = {1: 2}
	d[1] = 3
	var x = d[1]
",
		"func f():
	var x = 1
	x = 2
	return x
",
		"func f():
	var a = [1]
	a.append(\"s\")
",
		"func f():
	var a = []
	a.append(1)
",
		"func f():
	var x = 1.5
	x = 2.5
	return x
",
	]:
		var m = LO.lower(SR.parse_source(text + "
"))
		if m == null or m["funcs"].is_empty():
			print("fl|", i, "|NODE")
			i += 1
			continue
		var ly = HP.analyze_func_layout(m["funcs"][0])
		var out = {"unboxed": _fl_map(ly["unboxed"]), "arrays": _fl_map(ly["arrays"]), "dicts": _fl_map(ly["dicts"])}
		print("fl|", i, "|", JSON.stringify(out))
		i += 1

func rb_face():
	CTX.begin_emit(null)
	CTX.ctx["UNBOXED"] = {"x": "int", "y": "float", "s": "str"}
	var i = 0
	for text in ["x + 1", "1 + 2", "x < 1", "y + 1.5", "s + \"a\"", "1 + 2.5"]:
		var m = LO.lower(SR.parse_source("var __v = " + text + "
"))
		var node = m["vars"][0].get("init")
		var r = AB.try_raw_binary(node)
		if r == null:
			print("rb|", i, "|null")
		else:
			print("rb|", i, "|", r["code"], "|", r["rep"])
		i += 1
	var j = 0
	for text in ["var a
", "var a = 1
", "var a: int = 2
", "var a: Array[int] = [1]
"]:
		var m2 = LO.lower(SR.parse_source(text))
		var v = m2["vars"][0]
		print("si|", j, "|", AB.slot_init(v.get("type"), v.get("init"), false))
		j += 1
	var m3 = LO.lower(SR.parse_source("var a = 1
static var b = 2
"))
	var k = 0
	for v2 in m3["vars"]:
		print("sp|", k, "|", AB.prop_slot_init(v2))
		k += 1

func fn2_face():
	CTX.begin_emit(null)
	var i = 0
	for text in [
		"func f(a):
	return a
",
		"func f(a: int) -> int:
	return a + 1
",
		"func f():
	var x = 1
	x = 2
	return x
",
		"func f():
	print(1)
",
		"static func f():
	pass
",
		"func f(p: int):
	pass
",
	]:
		var m = LO.lower(SR.parse_source(text))
		if m == null or m["funcs"].is_empty():
			print("efn|", i, "|NODE")
			i += 1
			continue
		print("efn|", i, "|", JSON.stringify(FN.emit_func(m["funcs"][0], 0)))
		i += 1

func cd_face():
	CTX.begin_emit(null)
	var i = 0
	for text in [
		"class K:
	var a = 1
",
		"class K:
	var v: int:
		get:
			return 1
",
		"class K:
	static var s = 1
	func f():
		return s
",
		"class K:
	signal sig
",
		"class K:
	var a = 1
	func _init(x = 1):
		self.a = x
",
	]:
		var m = LO.lower(SR.parse_source(text))
		if m == null or m["innerClasses"].is_empty():
			print("cd|", i, "|NODE")
			i += 1
			continue
		print("cd|", i, "|", JSON.stringify(CL.emit_class_decl(m["innerClasses"][0], 0)))
		i += 1

func ra_face():
	CTX.begin_emit(null)
	var i = 0
	for text in [
		"func add(a, b):
	return a + b
func g():
	return add(1, 2)
",
		"func add(a, b):
	return a + b
",
		"func add(a, b):
	return a + b
func g():
	return add(1.5, 2)
",
		"func s(a):
	return \"x\"
func g():
	return s(1)
",
		"func r(a, b):
	return b
func g():
	var x = r(1, 2)
	return x
",
		"class K:
	pass
func add(a, b):
	return a + b
func g():
	return add(1, 2)
",
	]:
		var m = LO.lower(SR.parse_source(text))
		if m == null:
			print("ra|", i, "|NODE")
			i += 1
			continue
		var abis = AB.compute_raw_abis(m, {"hasBase": false, "inherited": {}, "external": {}})
		var keys = abis.keys()
		keys.sort()
		var out = {}
		for k in keys:
			out[k] = abis[k]
		print("ra|", i, "|", JSON.stringify(out))
		i += 1


func me_face():
	var i = 0
	for job in [
		{
			"src": "signal hit(x: int)
const K = 2
enum E { A, B }
class Inner extends RefCounted:
	var q = 1
	func ping() -> int:
		return q + 1
var count: int = 0
var label = \"x\"
static func twice(a: int) -> int:
	return a * 2
func _init():
	count = 1
func go(a: int) -> int:
	return a + K
",
			"opts": {"runtimeImport": "./rt.mjs", "hostImport": null, "className": "Main", "sourceFile": "main.gd"},
			"host": false,
		},
		{
			"src": "var hp: int = 10
func _ready():
	print(hp)
",
			"opts": {"runtimeImport": "./rt.mjs", "hostImport": null, "baseClass": {"kind": "engine", "name": "Node"}, "scene": {"rootName": "Main", "rootCls": "Node", "children": []}, "autoRun": true, "sourcemap": true, "sourceFile": "main.gd", "jsFile": "Main.mjs", "projectName": "demo", "resPath": "C:/proj/main.gd", "exportInner": true},
			"host": false,
		},
	]:
		var m = LO.lower(SR.parse_source(job["src"]))
		if m == null:
			print("me|", i, "|NODE")
			i += 1
			continue
		var an = AZ.analyze(m, {}, null, job["host"])
		var res = ME.emit_module_with_map(m, job["opts"], an)
		print("me|", i, "|", JSON.stringify(res))
		i += 1


func pj_face():
	var res_root = OS.get_environment("GDS2JS_BOOT_CASE").replace("\\", "/").trim_suffix("/")
	if res_root == "":
		print("pj|0|MISSING")
		return
	var opts = {"entries": [res_root + "/main.gd"], "resRoot": res_root, "outDir": "C:/out", "closureOnly": true, "runtimeImport": "./rt.mjs", "hostImport": null, "autoRun": true, "runtimeMode": "import", "sceneFile": null}
	var res = PJ.compile_project(opts)
	print("pj|0|", JSON.stringify(res))
