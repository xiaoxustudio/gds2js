extends SceneTree

func _initialize():
	print("a|", hash(Transform3D(Basis(Vector3(0, 0, 0), Vector3(0, 0, 0), Vector3(0, 0, 0)), Vector3(0, 0, 0))), "|", hash(Transform3D(Basis(Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(0, 0, 0))), "|", hash(Transform3D(Basis(Vector3(0, 1, 0), Vector3(0, 0, 0), Vector3(0, 0, 0)), Vector3(0, 0, 0))), "|", hash(Transform3D(Basis(Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(1, 0, 0))))
	quit()
