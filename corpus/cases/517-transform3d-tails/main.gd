extends SceneTree
func _initialize():
	var t := Transform3D(Basis(Vector3(0.5, 0.2, 0.1), Vector3(-0.3, 1.2, 0.4), Vector3(0.2, -0.5, 1.5)), Vector3(1, 2, 3))
	print("inv|", t.inverse())
	print("eq|", t.is_equal_approx(t))
	print("rl|", t.rotated_local(Vector3(0, 1, 0), 0.5))
	print("sl|", t.scaled_local(Vector3(2, 3, 4)))
	print("tl|", t.translated_local(Vector3(1, 2, 3)))
	quit()
