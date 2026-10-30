extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10)), Vector3(11, 12, 13))
	print("a|", str(t.scaled(Vector3(2, 3, 4))))
	quit()
