extends SceneTree
func _initialize():
	var q1 := Quaternion(0, 0, 0, 1)
	var q2 := Quaternion(Vector3(0, 1, 0), 0.8)
	var pre := Quaternion(Vector3(1, 0, 0), 0.3)
	var post := Quaternion(Vector3(0, 0, 1), 0.4)
	print("sc|", q1.spherical_cubic_interpolate(q2, pre, post, 0.25))
	quit()
