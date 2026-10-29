extends SceneTree

func _initialize():
	print("a|", str(Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 9)), Vector3(10, 11, 12))))
	quit()
