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
	var d = {}
	d[a] = 1
	print("k1a ", d.size(), " ", d.has(a), " ", d[a], " ", d.get(a))
	var b = []
	b.append(b)
	print("k1b ", d.has(b), " ", d[b], " ", b == a)
	d[b] = 2
	print("k1c ", d.size(), " ", d[a], " ", d[b])
	print("k1d ", str(d.keys()).length())
	print("k1e ", str(d).length())
	d.erase(a)
	print("k1f ", d.size(), " ", d.has(b))
	var p = []
	var q = [p]
	p.append(q)
	var r = []
	var s = [r]
	r.append(s)
	var d2 = {}
	d2[p] = 1
	print("k2a ", p == r, " ", d2.has(r), " ", d2[r], " ", d2.size())
	print("k2b ", d2.has([p]), " ", d2.has([[p]]))
	var e = []
	var f = []
	f.append(e)
	print("k2c ", e == f)
	var d3 = {}
	d3[e] = 1
	d3[f] = 2
	print("k2d ", d3.size(), " ", d3[e], " ", d3[f], " ", d3)
	var d4 = {}
	d4[nest(101)] = 1
	print("k3a ", d4.has(nest(102)), " ", d4[nest(102)], " ", nest(101) == nest(102))
	d4[nest(102)] = 2
	print("k3b ", d4.size(), " ", d4[nest(101)])
	print("k3c ", d4.has(nest(3)), " ", nest(3) == nest(4))
	print("k3d ", a == nest(101), " ", a == nest(100))
	var d5 = {}
	d5[a] = 7
	d5[nest(101)] = 8
	print("k3e ", d5.size(), " ", d5[a], " ", d5[nest(101)])
	var ca = {}
	ca["k"] = ca
	var cb = {}
	cb["k"] = cb
	print("k4a ", ca == cb)
	var d6 = {}
	d6[ca] = 1
	d6[cb] = 2
	print("k4b ", d6.size(), " ", d6[ca], " ", d6[cb], " ", str(d6).length())
	var md = {}
	var mx = []
	mx.append(md)
	md["a"] = mx
	var d7 = {}
	d7[mx] = 1
	print("k4c ", d7.has(mx), " ", d7[mx], " ", d7.size())
	var arr = [ca, mx]
	print("k4d ", arr.has(ca), " ", arr.count(cb), " ", arr.has(md))
	var ghost = [1, 2]
	var d8 = {}
	d8[ghost] = 5
	ghost.append(3)
	print("k4e ", d8.size(), " ", d8.has(ghost), " ", d8.has([1, 2]), " ", d8)
	print("k5a ", a == nest(51), " ", a == nest(52), " ", nest(51) == nest(52), " ", nest(52) == nest(53), " ", nest(52) == nest(54))
	print("k5b ", str(nest(51)).length(), " ", str(nest(101)).length(), " ", str(nest(102)).length())
	var d9 = {}
	d9[nest(100)] = 1
	print("k5c ", d9.has(nest(101)), " ", d9.size(), " ", d9.has(nest(40)), " ", nest(100) == nest(101))
	var da = {}
	da[nest(101)] = 1
	print("k5d ", da.has(nest(102)), " ", da.size(), " ", da[nest(102)])
	var db = {}
	var g1 = []
	g1.append(g1)
	var g2 = []
	g2.append([g2])
	db[g1] = 1
	print("k5e ", db.has(g2), " ", g1 == g2, " ", db.size())
	quit()
