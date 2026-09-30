extends SceneTree

func _initialize():
	var c := PackedColorArray([
		Color(0.9, 0.1, 0.1, 1),
		Color(0.1, 0.9, 0.1, 0.5),
		Color(0.5, 0.5, 0.5, 1),
		Color(0.1, 0.1, 0.9, 1),
		Color(0.5, 0.1, 0.9, 0.25),
	])
	c.sort()
	print("t1 ", c)
	c.reverse()
	c.sort()
	print("t2 ", c.size(), " ", c[0], " ", c[4])
	var v := PackedVector2Array([Vector2(1, 2), Vector2(3, 4)])
	print("t3 ", v.has(Vector2(1, 2)), " ", v.has(Vector2(1, 3)), " ", v.count(Vector2(3, 4)), " ", v.find(Vector2(3, 4)), " ", v.find(Vector2(9, 9)))
	var f := PackedVector2Array([Vector2(1.0000001, 2), Vector2(1, 2)])
	print("t4 ", f.has(Vector2(1, 2)), " ", f.count(Vector2(1, 2)))
	var col := PackedColorArray([Color(0.1, 0.2, 0.3, 1), Color(0.1, 0.2, 0.3, 0.5)])
	print("t5 ", col.has(Color(0.1, 0.2, 0.3, 1)), " ", col.count(Color(0.1, 0.2, 0.3, 0.5)), " ", col.find(Color(0.1, 0.2, 0.3, 0.5)))
	print("t6 ", col.has(Color(0.10000001, 0.2, 0.3, 1)))
	var w := PackedVector3Array([Vector3(1, 2, 3)])
	print("t7 ", w.has(Vector3(1, 2, 3)), " ", w.find(Vector3(1, 2, 3)), " ", w.count(Vector3(1, 2, 3)))
	var b := PackedByteArray([7, 8, 9])
	print("t8 ", b.get(1), " ", b[-1], " ", b.size())
	var s := PackedStringArray(["a", "b", "c"])
	print("t9 ", s.get(2), "|", s[-1], "|", s[0])
	var q := PackedByteArray([1, 2, 3])
	q.set(0, 300)
	print("t10 ", q)
	var f32 := PackedFloat32Array([1.5, 2.5])
	f32.set(0, 3)
	f32.set(1, 0.1)
	print("t11 ", f32)
	var i64 := PackedInt64Array([1, 2])
	i64.set(1, -3)
	print("t12 ", i64)
	print("t13 ", PackedByteArray(["12abc"]), " ", PackedInt32Array(["-7xyz"]), " ", PackedFloat32Array(["abc"]), " ", PackedFloat64Array(["1.5abc"]))
	print("t14 ", PackedInt64Array([1e30, 2.7, -2.7]), " ", PackedInt32Array([1e30, 2147483648.0]))
	quit()
