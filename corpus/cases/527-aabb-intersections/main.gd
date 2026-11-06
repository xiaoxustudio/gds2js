extends SceneTree
func _initialize():
	var a := AABB(Vector3(0, 0, 0), Vector3(2, 2, 2))
	print("ray|", a.intersects_ray(Vector3(-1, 1, 1), Vector3(1, 0, 0)), "|", a.intersects_ray(Vector3(-1, 1, 1), Vector3(-1, 0, 0)))
	print("seg|", a.intersects_segment(Vector3(-1, 1, 1), Vector3(3, 1, 1)), "|", a.intersects_segment(Vector3(-1, 1, 1), Vector3(-0.5, 1, 1)))
	var p := Plane(Vector3(0, 1, 0), 1)
	print("pl|", a.intersects_plane(p), "|", a.intersects_plane(Plane(Vector3(0, 1, 0), 5)))
	quit()
