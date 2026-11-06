extends SceneTree
func _initialize():
	print("fs|", Basis.from_scale(Vector3(2, 3, 4)))
	var e := Basis.from_euler(Vector3(0.1, 0.2, 0.3))
	print("fe|", e)
	print("ge|", e.get_euler())
	print("q|", e.get_rotation_quaternion())
	var y90 := Basis(Vector3(0, 1, 0), PI / 2)
	print("sl|", Basis().slerp(y90, 0.5))
	quit()
