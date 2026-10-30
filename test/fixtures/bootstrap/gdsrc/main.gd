extends SceneTree

const L = preload("res://lexer.gd")
const I = preload("res://indent.gd")
const S = preload("res://state.gd")
const D = preload("res://diag.gd")


func _initialize():
	show("m01", "var x = 42\nfunc f(a):\n\treturn \"hi\"\t# tail\n")
	show("m02", "a1 = 3.5\n\tif b>=c:\n\t\tprint(2)\n")
	show("m03", "x = \"unclosed\ny = 1\n")
	show("m04", "op = 1\nz = 2\n")
	show("m05", "id_é = 1\n\ttab = 2\n")
	show("m06", "0x1F 0b1010 0o17 1_000 3.5e-3 .5 1. 1..2 2 **= 3 super._init()\n")
	show("m07", "r\"C:\\tmp\" &\"NodeName\" ^\"A/B\" @\"C\" \"\"\"triple\nline\"\"\" '''tri'''\n")
	show("m08", "\"a\\u00e9b\" \"c\\U0001F600d\" \"e\\\\f\" \"g\\x41h\" \"i\\o101j\"\n")
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
	quit()


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
