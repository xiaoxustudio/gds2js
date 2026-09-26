extends SceneTree

var m: Vector2i = Vector2i(1, 2)

func bump(p: Vector2i):
	p.x = 7
	print(p)

func _initialize():
	var w = Vector2i(1, 2)
	print(w, " ", Vector2i(), " ", Vector2i(-1.7, -2.2), " ", Vector2i(w), " ", Vector2i(Vector2(1.7, 2.2)))
	print(Vector2(w), " ", Vector2(Vector2(3, 4)))
	print(w.x, " ", w.y, " ", w[0], " ", w["y"])
	print(w == Vector2i(1.0, 2.0), " ", w != Vector2i(1, 3), " ", w == null, " ", w != null)
	print(w < Vector2i(1, 3), " ", w > Vector2i(0, 9), " ", w <= Vector2i(1, 2))
	print(w + Vector2i(3, -4), " | ", w - Vector2i(1, 1), " | ", w * Vector2i(4, 5), " | ", w * 2, " | ", w / Vector2i(2, 2), " | ", -w)
	print(Vector2i(7, -7) / Vector2i(2, 2), " | ", Vector2i(-7, 7) % Vector2i(2, -2), " | ", Vector2i(6, 6) * 0.5, " | ", Vector2i(6, 6) / 4.0)
	print(Vector2i(2147483647, 0) + Vector2i(1, 0), " | ", Vector2i(-2147483648, 5) - Vector2i(1, 0), " | ", Vector2i(2147483647, 0) * 2)
	var big = Vector2i(2147483647, 1)
	print(big * Vector2i(2, 2), " | ", -big, " | ", big.length_squared())
	var v = Vector2i(1, 2)
	v.x = 2.7
	print(v, " ", v.x)
	v[1] = -0.9
	print(v)
	v.x = 2147483648
	print(v)
	m.y = 9
	print(m)
	var arr = [Vector2i(1, 2)]
	arr[0].x = 5
	print(arr)
	var ddc = { "k": Vector2i(1, 2) }
	ddc["k"].y = 8
	print(ddc)
	for x in arr:
		x.y = 100
	print(arr)
	var w2 = v
	w2.x = 42
	print(v, " ", w2)
	var q = Vector2i(3, -4)
	print(q.length(), " | ", q.length_squared(), " | ", q.aspect(), " | ", q.abs(), " | ", q.sign())
	print(q.min(Vector2i(1, 9)), " | ", q.max(Vector2i(1, 9)), " | ", q.clamp(Vector2i(1, 1), Vector2i(4, 4)))
	var s7 = Vector2i(7, 3)
	print(s7.snapped(Vector2i(2, 2)), " | ", s7.distance_to(Vector2i(0, 0)), " | ", s7.distance_squared_to(Vector2i(0, 0)), " | ", s7.min_axis_index(), s7.max_axis_index())
	print(Vector2i(-7, 3).snapped(Vector2i(2, 2)), " | ", Vector2i(-7, 3).snapped(Vector2i(0, 1)), " | ", Vector2i(0, 0).length(), " | ", Vector2i(0, 0).aspect(), " | ", Vector2i(3, 0).aspect())
	print(Vector2i.MIN.abs(), " | ", -Vector2i.MIN, " | ", Vector2i.MIN.sign())
	print(Vector2i.ONE, " ", Vector2i.ZERO, " ", Vector2i.UP, " ", Vector2i.DOWN, " ", Vector2i.LEFT, " ", Vector2i.RIGHT, " ", Vector2i.MAX, " ", Vector2i.MIN)
	print(typeof(w), " ", w is Vector2i, " ", w is Vector2, " ", str(w))
	var d = {}
	d[Vector2i(1, 2)] = 5
	print(d, " ", d.get(Vector2i(1, 2), "M"), " ", d.get(Vector2i(1.7, 2.2), "M"), " ", d.has(Vector2i(1, 3)))
	var d2 = {}
	d2[Vector2i(1, 2)] = 1
	d2[Vector2i(1.7, 2.2)] = 2
	print(d2, " size=", d2.size())
	var ta: Array[Vector2i] = []
	ta.resize(2)
	print(ta)
	ta[0] = Vector2i(3, 4)
	print(ta, " ", ta[0].y)
	var tdi: Dictionary[Vector2i, int] = {}
	tdi[Vector2i(1, 2)] = 5
	print(tdi, " ", tdi.get(Vector2i(1, 2), "M"), " ", tdi.get(Vector2i(1.7, 2.2), "M"))
	var sv = [Vector2i(3, 1), Vector2i(1, 2), Vector2i(3, 0)]
	sv.sort()
	print(sv, " ", sv.has(Vector2i(1, 2)), " ", sv.count(Vector2i(1.0, 2.0)))
	bump(v)
	print(v)
	quit()
