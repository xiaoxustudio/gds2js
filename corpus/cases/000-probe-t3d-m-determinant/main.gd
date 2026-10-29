extends SceneTree

func _initialize():
	print("a|", str(Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3.ZERO).determinant()))
	quit()
