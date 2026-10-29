extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10)), Vector3(11, 12, 13))
	t.origin.x = 99.0
	print("a|", str(t), "|", t.origin.x)
	quit()
