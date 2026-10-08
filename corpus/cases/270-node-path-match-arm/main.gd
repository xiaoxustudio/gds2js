extends SceneTree

func g(p, tag):
	match p:
		^"a/b":
			print(tag, "np-arm")
		"a/b":
			print(tag, "string-arm")
		&"a/b":
			print(tag, "stringname-arm")
		5:
			print(tag, "int-arm")
		[1, 2]:
			print(tag, "array-arm")
		_:
			print(tag, "other")

func h(p, tag):
	match p:
		"a/b":
			print(tag, "string-arm")
		_:
			print(tag, "other")

func n(p, tag):
	match p:
		^"a/b":
			print(tag, "np-arm")
		_:
			print(tag, "other")

func _initialize():
	g(^"a/b", "t01|")
	g(NodePath("a/b"), "t02|")
	g("a/b", "t03|")
	g(&"a/b", "t04|")
	g(5, "t05|")
	g([1, 2], "t06|")
	g(^"x", "t07|")
	g("", "t08|")
	h(^"a/b", "t09|")
	h(NodePath("a/b"), "t10|")
	h("a/b", "t11|")
	h(&"a/b", "t12|")
	n("a/b", "t13|")
	n(&"a/b", "t14|")
	n(5, "t15|")
	n(^"a/b", "t16|")
	quit()
