extends SceneTree
func _initialize():
	var p := Plane(Vector3(0, 1, 0), 2)
	print("c|", p.get_center(), "|", p.is_point_over(Vector3(0, 5, 0)), "|", p.is_point_over(Vector3(0, 0, 0)), "|", p.is_finite())
	print("proj|", p.project(Vector3(1, 5, 3)))
	print("seg|", p.intersects_segment(Vector3(0, 0, 0), Vector3(0, 10, 0)), "|", p.intersects_segment(Vector3(0, 0, 0), Vector3(0, 1, 0)))
	var q := Plane(Vector3(1, 0, 0), 0)
	var r := Plane(Vector3(0, 0, 1), 0)
	print("i3|", p.intersect_3(q, r))
	quit()
