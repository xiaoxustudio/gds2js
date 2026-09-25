extends SceneTree

func _initialize():
	var d = {1: "a"}
	d[1.0] = "b"
	print(d)
	print(d[1])
	print(d[1.0])
	print(d.size())
	print(d.has(1.5))
	print(d.has(1))
	var g = {1: "i", true: "b", 1.0: "f"}
	print(g)
	print(g.size())
	print(g.has(1))
	print(g.has(true))
	print(g.has(1.0))
	var f = {Vector2(1, 2): "v", Vector2(2, 1): "w"}
	print(f)
	print(f[Vector2(1, 2)])
	print(f.size())
	var k = {}
	k[Vector2(1, 2)] = "a"
	k[Vector2(1.0, 2.0)] = "b"
	print(k)
	print(k.size())
	var h = {9007199254740993: "big", 9007199254740992.0: "bigf"}
	print(h)
	print(h.size())
	var e = {}
	e[0.0 / 0.0] = "nan1"
	print(e)
	print(e.size())
	var z = {}
	z[0.0] = "zero"
	z[-0.0] = "negzero"
	print(z)
	print(z.size())
	quit()
