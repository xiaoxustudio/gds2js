extends SceneTree

func _initialize():
	var a = [1, 2]
	var c = a.append
	a.append(3)
	print("B1|", c == a.append, " ", a)
	var b = [1, 2]
	var d = b.append
	print("B2|", d == b.append)
	d.call(7)
	print("B3|", d == d, " ", d == b.append, " ", b)
	var e = [1, 2]
	var f = e.append
	f.callv([8])
	print("B4|", f == e.append, " ", e)
	var g = [1, 2]
	var h = g.append.bind(9)
	print("B5|", h == g.append, " ", h.call(), " ", g)
	var k = [1, 2]
	var m = k.size
	print("B6|", m == k.size)
	m.call()
	print("B7|", m == k.size)
	var p = PackedInt32Array([1, 2])
	var q = p.append
	p.append(3)
	print("B8|", q == p.append, " ", p)
	var v = Vector2(1, 2)
	var n = v.normalized
	v = Vector2(3, 4)
	print("B9|", n == v.normalized, " ", v)
	var r = [1, 2]
	var s1 = r.append
	var s2 = r.append
	r.append(5)
	print("B10|", s1 == s2, " ", s1 == r.append)
	var w = [[1]]
	var t = w.append
	w[0].append(2)
	print("B11|", t == w.append, " ", w, " ", w[0])
	quit()
