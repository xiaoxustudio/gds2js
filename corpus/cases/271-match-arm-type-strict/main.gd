extends SceneTree

func num(p, tag):
	match p:
		5:
			print(tag, "int-arm")
		5.0:
			print(tag, "float-arm")
		"5":
			print(tag, "str-arm")
		&"5":
			print(tag, "sn-arm")
		_:
			print(tag, "other")

func flt(p, tag):
	match p:
		5.0:
			print(tag, "float-arm")
		_:
			print(tag, "other")

func boo(p, tag):
	match p:
		true:
			print(tag, "bool-arm")
		_:
			print(tag, "other")

func nul(p, tag):
	match p:
		null:
			print(tag, "null-arm")
		_:
			print(tag, "other")

func str_(p, tag):
	match p:
		"a":
			print(tag, "str-arm")
		_:
			print(tag, "other")

func snm(p, tag):
	match p:
		&"a":
			print(tag, "sn-arm")
		_:
			print(tag, "other")

func arr(p, tag):
	match p:
		[1, 2]:
			print(tag, "int-array-arm")
		_:
			print(tag, "other")

func narr(p, tag):
	match p:
		[[1]]:
			print(tag, "nested-arm")
		_:
			print(tag, "other")

func sar(p, tag):
	match p:
		["a"]:
			print(tag, "str-array-arm")
		_:
			print(tag, "other")

func dct(p, tag):
	match p:
		{"a": 1}:
			print(tag, "dict-arm")
		_:
			print(tag, "other")

func ndp(p, tag):
	match p:
		^"a/b":
			print(tag, "np-arm")
		_:
			print(tag, "other")

func _initialize():
	num(5, "t01|")
	num(5.0, "t02|")
	num("5", "t03|")
	num(&"5", "t04|")
	num(true, "t05|")
	num(null, "t06|")
	num(Vector2(1, 2), "t07|")
	num(rid_from_int64(5), "t08|")
	num([5], "t09|")
	num({"a": 5}, "t10|")
	num(1, "t11|")
	flt(5.0, "t12|")
	flt(5, "t13|")
	boo(true, "t14|")
	boo(1, "t15|")
	nul(null, "t16|")
	nul("x", "t17|")
	nul(Vector2(1, 2), "t18|")
	str_("a", "t19|")
	str_(&"a", "t20|")
	str_(Vector2(1, 2), "t21|")
	snm("a", "t22|")
	snm(&"a", "t23|")
	snm(5, "t24|")
	arr([1, 2], "t25|")
	arr([1.0, 2.0], "t26|")
	arr([1, 2, 3], "t27|")
	narr([[1]], "t28|")
	narr([[1.0]], "t29|")
	sar(["a"], "t30|")
	sar([&"a"], "t31|")
	dct({ "a": 1 }, "t32|")
	dct({ "a": 1.0 }, "t33|")
	dct({ "b": 1 }, "t34|")
	dct({ "a": 1, "b": 2 }, "t35|")
	ndp(^"a/b", "t36|")
	ndp(NodePath("a/b"), "t37|")
	ndp("a/b", "t38|")
	ndp(Vector2(1, 2), "t39|")
	ndp(rid_from_int64(5), "t40|")
	quit()
