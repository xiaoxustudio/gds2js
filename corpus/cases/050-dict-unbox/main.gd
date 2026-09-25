extends SceneTree

func _initialize():
	var d = {}
	var i = 0
	var s = 0
	while i < 3:
		d[i] = i * 10
		i += 1
	var j = 0
	while j < d.size():
		s += d[j]
		j += 1
	print(s)
	print(d.size())
	print(d[2])
	var e = {}
	e["a"] = 1
	e["b"] = 2
	print(e["a"] + e["b"])
	print(e.size())
	var g = {}
	g[1.0] = 5
	print(g[1.0])
	var m = {}
	m[0] = 1
	m[1] = 2.5
	print(m[0] + m[1])
	var h = {}
	h[0] = 1
	var k = h
	k[1] = 2
	print(h.size())
	quit()
