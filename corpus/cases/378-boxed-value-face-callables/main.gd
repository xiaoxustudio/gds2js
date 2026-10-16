extends SceneTree

func _initialize():
	var v = Vector2(3, 4)
	print("N1|", v.length, " ", v.length.call())
	print("N2|", v.x, " ", v.normalized, " ", v.normalized.call())
	var w = Vector2i(3, 4)
	print("N3|", w.distance_to, " ", w.distance_to.call(Vector2i(1, 1)), " ", w.x)
	var c = Color(1, 0.5, 0.25, 1)
	print("N4|", c.to_html, " ", c.to_html.call(), " ", c.r)
	var q = Vector3(1, 2, 2)
	print("N5|", q.length, " ", q.length.call(), " ", q.z)
	var r = Vector3i(1, 2, 2)
	print("N6|", r.length, " ", r.length.call(), " ", w.distance_to.get_argument_count())
	print("N7|", v.length == Vector2(3, 4).length, " ", v.length == w.length)
	quit()
