extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3(1, 2, 3))
	print("a|", str(t * Vector3(1, 1, 1)))
	quit()
