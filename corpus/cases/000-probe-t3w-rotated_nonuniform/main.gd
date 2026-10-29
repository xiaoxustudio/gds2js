extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10)), Vector3(11, 12, 13))
	print("a|", str(t.rotated(Vector3(0, 1, 0), 0.5)))
	quit()
