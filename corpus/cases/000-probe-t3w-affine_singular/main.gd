extends SceneTree

func _initialize():
	print("a|", str(Transform3D(Basis(Vector3(0, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 0)), Vector3(1, 1, 1)).affine_inverse()))
	quit()
