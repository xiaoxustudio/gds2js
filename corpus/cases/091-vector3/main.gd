extends SceneTree

var m: Vector3 = Vector3(1, 2, 3)

func bump(p: Vector3):
	p.x = 7
	print(p)

func make() -> Vector3:
	var t = Vector3(1, 2, 3)
	return t

func _initialize():
	var v = Vector3(1, 2, 3)
	print(v, " ", Vector3(), " ", Vector3(v))
	print(v.x, " ", v.y, " ", v.z, " ", v[0], " ", v[2], " ", v["y"])
	print(Vector3(0.1, 0, 0).x)
	print(Vector3(1, 2, 3) + Vector3(0.5, 0, 0), " | ", Vector3(1, 2, 3) - Vector3(1, 1, 1))
	print(Vector3(1, 2, 3) * 2.5, " | ", Vector3(2, 3, 4) * Vector3(0.5, 1, 2), " | ", Vector3(2, 3, 4) / 2, " | ", Vector3(2, 3, 4) / Vector3(2, 3, 4))
	print(-Vector3(1, 2, 3))
	var w = v
	w.z = 9
	print(v, " ", w)
	var a = [Vector3(1, 2, 3)]
	a[0].x = 5
	print(a)
	var d = { "k": Vector3(1, 2, 3) }
	d["k"].y = 8
	print(d)
	m.x = 4
	print(m)
	v[1] = 2.5
	v["z"] = 1
	print(v, " ", v.y)
	print(Vector3(1, 2, 3) < Vector3(1, 2, 4), " ", Vector3(1, 3, 0) < Vector3(2, 0, 0), " ", Vector3(0, 1, 9) < Vector3(0, 2, 0), " ", Vector3(1, 2, 3) <= Vector3(1, 2, 3), " ", Vector3(1, 2, 3) >= Vector3(1, 2, 4))
	print(Vector3(1, 2, 3) == Vector3(1, 2, 3.0000001), " ", Vector3(0.1 + 0.2, 0, 0) == Vector3(0.3, 0, 0), " ", Vector3(1, 2, 3) != null, " ", Vector3(1, 2, 3) == null)
	print(Vector3.UP, " ", Vector3.DOWN, " ", Vector3.LEFT, " ", Vector3.RIGHT, " ", Vector3.FORWARD, " ", Vector3.BACK, " ", Vector3.ONE, " ", Vector3.ZERO, " ", Vector3.INF)
	print(v.length(), " ", v.length_squared(), " ", Vector3(3, 4, 0).length())
	print(Vector3(1, 0, 0).dot(Vector3(0, 1, 0)), " ", Vector3(1, 0, 0).cross(Vector3(0, 1, 0)), " ", Vector3(1, 2, 3).cross(Vector3(0, 1, 0)))
	print(Vector3(3, 4, 0).normalized(), " ", Vector3.ZERO.normalized(), " ", Vector3(1, 2, 3).limit_length(1.0), " ", Vector3(0.1, 0.2, 0.3).limit_length(10.0))
	print(Vector3(1, 2, 3).lerp(Vector3(2, 3, 4), 0.5), " ", Vector3(1, 2, 3).distance_to(Vector3(1, 2, 4)), " ", Vector3(1, 2, 3).distance_squared_to(Vector3(1, 2, 4)), " ", Vector3(1, 2, 3).direction_to(Vector3(1, 2, 4)))
	print(Vector3(-1.5, 2, -3).abs(), " ", Vector3(-1.5, 0, 3).sign(), " ", Vector3(1.7, -1.2, 0.5).floor(), " ", Vector3(1.7, -1.2, 0.5).ceil(), " ", Vector3(1.5, 2.5, -0.5).round(), " ", Vector3(-1.5, -2.5, 3.5).round())
	print(Vector3(1.2, 2.6, 3.1).snapped(Vector3(0.5, 0.5, 0.5)), " ", Vector3(1.4, 2.6, 3.1).snappedf(1.0))
	print(Vector3(1, 2, 3).clamp(Vector3(1.5, 1.5, 1.5), Vector3(2.5, 2.5, 2.5)), " ", Vector3(1, 2, 3).min(Vector3(2, 1, 5)), " ", Vector3(1, 2, 3).max(Vector3(2, 1, 5)))
	print(Vector3(0, 1, 0).angle_to(Vector3(1, 0, 0)))
	print(Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 2, 2), Vector3(3, 3, 3), Vector3(4, 4, 4), 0.5))
	print(Vector3(1, 2, 3).min_axis_index(), Vector3(1, 2, 3).max_axis_index())
	print(Vector3(1, 2, 3).is_equal_approx(Vector3(1.0000095, 2, 3)), " ", Vector3(1, 2, 3).is_equal_approx(Vector3(1.00001, 2, 3)))
	print(Vector3(3, 4, 5).is_equal_approx(Vector3(3.000029, 4, 5)), " ", Vector3(3, 4, 5).is_equal_approx(Vector3(3.000031, 4, 5)))
	print(Vector3(0.001, 0, 0).is_equal_approx(Vector3(0.0010002, 0, 0)), " ", Vector3(1, 2, 3).is_equal_approx(Vector3(1, 2, 3)))
	print(Vector3(1, 1, 1).is_normalized(), " ", Vector3(1, 0, 0).is_normalized(), " ", Vector3(0.7071067811865475, 0.7071067811865475, 0).is_normalized())
	print(Vector3(1e300, 0, 0).is_finite(), " ", Vector3(1, 2, 3).is_finite())
	print(typeof(v), " ", v is Vector3, " ", v is Vector2, " ", str(v))
	var dd = {}
	dd[Vector3(1, 2, 3)] = 5
	print(dd, " ", dd.get(Vector3(1.0, 2.0, 3.0), "M"), " ", dd.has(Vector3(9, 2, 3)))
	var ta: Array[Vector3] = []
	ta.resize(2)
	print(ta)
	ta[0] = Vector3(1, 2, 3)
	print(ta, " ", ta[0].z)
	var sv = [Vector3(3, 1, 0), Vector3(1, 2, 3), Vector3(2, 0, 0)]
	sv.sort()
	print(sv)
	print(sv.has(Vector3(3, 1, 0)), " ", sv.count(Vector3(1.0, 2.0, 3.0)))
	bump(v)
	print(v)
	var r = make()
	r.x = 3
	print(r, " ", make())
	var arr2 = [Vector3(1, 2, 3)]
	for x in arr2:
		x.z = 100
	print(arr2)
	quit()
