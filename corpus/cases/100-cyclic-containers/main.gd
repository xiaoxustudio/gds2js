extends SceneTree

func nest(n: int):
	var c = []
	for i in range(n):
		var x = []
		x.append(c)
		c = x
	return c

func _initialize():
	var a = []
	a.append(a)
	print(a)
	print(str(a).length(), " ", a.size(), " ", a[0] == a, " ", a[0][0] == a)
	var d = {}
	d["x"] = d
	print(str(d).length())
	print(d)
	var p = []
	var q = [p]
	p.append(q)
	print(p == q, " ", str(p).length())
	var b = []
	b.append(b)
	print(a == b, " ", a == a)
	var f = {}
	f["x"] = f
	print(d == f, " ", d == d)
	var ca = a.duplicate(true)
	print(ca[0] == ca, " ", ca.size(), " ", str(ca).length())
	print(ca[0][0] == ca)
	var cd = d.duplicate(true)
	print(cd["x"] == cd, " ", str(cd).length())
	print(a.duplicate()[0] == a)
	print(str(nest(99)).length(), " ", str(nest(100)).length(), " ", str(nest(101)).length(), " ", str(nest(102)).length())
	print(nest(101) == nest(102))
	print(str([a, a]).length())
	quit()
