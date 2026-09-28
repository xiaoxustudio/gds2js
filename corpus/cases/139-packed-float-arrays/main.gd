extends SceneTree

func _initialize():
	var f = PackedFloat32Array([0.1, 2.7, 1.0 / 3, 1e-5, 123456.789, -0.0, 1e20])
	print("u1 ", f, " ", typeof(f))
	print("u2 ", f[0], " ", f[0] == 0.1, " ", typeof(f[0]))
	var d = PackedFloat64Array([0.1, 2.7, 1.0 / 3, 1e20, 1e308])
	print("u3 ", d, " ", typeof(d), " ", d[0] == 0.1)
	var m = PackedFloat64Array([1, true, 3])
	print("u4 ", m)
	var r = PackedFloat32Array()
	r.resize(3)
	print("u5 ", r)
	var added = r.append(2.5)
	print("u5b ", added, " ", r, " ", r.size())
	var g = PackedFloat32Array([1.5, 2.5])
	var h = g
	h[0] = 9.25
	print("u6 ", g, " ", h)
	var k = g.duplicate()
	k[1] = 0.5
	print("u7 ", g, " ", k)
	print("u8 ", g == PackedFloat32Array([9.25, 2.5]), " ", g + PackedFloat32Array([3.5]))
	print("u9 ", g.get(5), " ", g[-1], " ", g.has(9.25), " ", g.find(2.5))
	g[-1] = 8.25
	print("u10 ", g)
	var s = PackedFloat64Array([2.5, 1.5, 0.25])
	s.sort()
	var sliced = s.slice(1)
	var code = s.insert(0, 9.5)
	print("u11 ", s, " ", sliced, " ", code, " ", s)
	var q: PackedFloat64Array
	print("u12 ", q, " ", q == PackedFloat64Array(), " ", q.size())
	quit()
