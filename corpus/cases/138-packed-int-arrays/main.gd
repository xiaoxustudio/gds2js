extends SceneTree

func _initialize():
	var a = PackedInt32Array([1, 2])
	print("u1 ", a, " ", typeof(a), " ", a.size())
	var big = PackedInt32Array([2147483648, -2147483649, 4294967296, 2.7, -2.7, true])
	print("u2 ", big)
	var f = PackedInt32Array([0.1, 1.0, 1e308])
	print("u3 ", f, " ", f[0], " ", f[0] == 0.1)
	var b = PackedInt64Array([2147483648, -2147483649, 9007199254740993, 2.7, true])
	print("u4 ", b, " ", typeof(b), " ", b[0], " ", typeof(b[0]))
	var g = PackedInt32Array()
	g.append(300)
	g.resize(4)
	print("u5 ", g, " ", g.size())
	var h = a
	h[0] = 77
	print("u6 ", a, " ", h)
	print("u7 ", a == PackedInt32Array([77, 2]), " ", a + PackedInt32Array([3]))
	print("u8 ", a.get(5), " ", a.get(1), " ", a.has(77), " ", a.count(2), " ", a.find(77))
	var s = PackedInt32Array([3, 1, 2])
	s.sort()
	print("u12 ", s, " ", s.slice(1), " ", s.duplicate() == s)
	var t: PackedInt32Array
	var u: PackedInt64Array
	print("u13 ", t, " ", u, " ", t == PackedInt32Array())
	t.resize(3)
	t[-1] = 8
	print("u14 ", t, " ", t[-1])
	print("u15 ", a.append(9), " ", a.size())
	print("u16 ", b[-1], " ", b.get(0), " ", b.count(2147483648))
	quit()
