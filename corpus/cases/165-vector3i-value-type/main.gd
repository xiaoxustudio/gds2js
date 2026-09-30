extends SceneTree

func _initialize():
	var a = Vector3i(3, -4, 12)
	var b = Vector3i(1, 2, 3)
	print("ctor ", Vector3i(), " ", a, " ", Vector3i(1.9, -2.9, 3.5), " ", Vector3i(2147483648, -2148, 0), " ", Vector3i(b))
	print("from ", Vector3i(Vector3(1.7, -2.2, 3.5)), " ", Vector3(b), " ", typeof(Vector3(b)))
	print("arith ", a + b, " ", a - b, " ", a * b, " ", a / b, " ", a % b, " ", -a)
	print("scalar ", a * 2, " ", 2 * a, " ", a / -2, " ", a % -2, " ", a / 4.0, " ", a * 0.5)
	print("wrap ", Vector3i(2147483647, 0, 0) + Vector3i(1, 0, 0), " ", Vector3i(-2147483648, 0, 0) - Vector3i(1, 0, 0))
	print("meth ", a.abs(), " ", a.sign(), " ", a.length(), " ", a.length_squared(), " ", a.min(b), " ", a.max(b))
	print("more ", a.clamp(Vector3i(0, 0, 0), Vector3i(5, 5, 5)), " ", a.snapped(Vector3i(5, 5, 5)), " ", a.min_axis_index(), " ", a.max_axis_index())
	print("dist ", a.distance_to(Vector3i()), " ", a.distance_squared_to(Vector3i(1, 1, 1)), " ", typeof(a.distance_to(Vector3i())))
	print("static ", Vector3i.ZERO, " ", Vector3i.ONE, " ", Vector3i.MIN, " ", Vector3i.MAX, " ", Vector3i.UP, " ", Vector3i.DOWN, " ", Vector3i.LEFT, " ", Vector3i.RIGHT, " ", Vector3i.FORWARD, " ", Vector3i.BACK, " ", Vector3i.AXIS_X, " ", Vector3i.AXIS_Z)
	print("cmp ", a < b, " ", a <= a, " ", a > b, " ", a == Vector3i(3, -4, 12), " ", a != b, " ", typeof(a), " ", a is Vector3i, " ", a is Variant)
	var idx = Vector3i(7, 8, 9)
	print("index ", idx[0], " ", idx[1], " ", idx[2], " ", idx["y"])
	idx[1] = 7.9
	idx.z = -0.9
	print("write ", idx, " ", idx.y, " ", typeof(idx.z))
	print("str ", str(a), " ", &"x" + str(a))
	var d = { Vector3i(1, 2, 3): "a" }
	d[Vector3i(1, 2, 4)] = "b"
	print("dict ", d, " ", d.has(Vector3i(1, 2, 3)), " ", d.size())
	var arr: Array[Vector3i] = [Vector3i(1, 2, 3)]
	arr.append(Vector3(4.7, 5.2, 6.9))
	print("typed ", arr, " ", arr[1], " ", typeof(arr[0]), " ", arr[0].z)
	var p = PackedVector3Array([Vector3i(1, 2, 3), Vector2i(4, 5)])
	p.append(Vector3i(7, 8, 9))
	print("pack ", p, " ", typeof(p[0]), " ", p.count(Vector3i(1, 2, 3)), " ", p.has(Vector3i(1, 2, 3)), " ", p.find(Vector3i(7, 8, 9)))
	var wv: Vector3 = Vector3i(4, 5, 6)
	var wi: Vector3i = Vector3(1.7, 2.2, 3.9)
	var v2i: Vector2i = Vector2(1.7, -2.9)
	print("slot ", wv, " ", typeof(wv), " ", wi, " ", typeof(wi), " ", v2i, " ", typeof(v2i))
	print("as ", (a as Vector3).x, " ", a as Variant)
	quit()
