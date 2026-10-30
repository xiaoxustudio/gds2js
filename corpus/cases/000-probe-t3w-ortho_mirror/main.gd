extends SceneTree

func _initialize():
	print("a|", str(Transform3D(Basis(Vector3(1, 0, 0), Vector3(0, -1, 0), Vector3(0, 0, 1)), Vector3(2, 3, 4)).orthonormalized()))
	quit()
