extends SceneTree

func _initialize():
	print(Vector3(1, 1, 1).rotated(Vector3(1, 1, 1), 2.0))
	print(Vector3(1, 2, 3).rotated(Vector3(0, 0, 0), 1.0))
	print(Vector3(2, -1, 0.5).rotated(Vector3(2, 0, 0), 1.0))
	print(Vector3(1, 2, 3).rotated(Vector3(0.999999, 0, 0), 1.0))
	print(Vector3(1, 2, 3).rotated(Vector3(0.6, 0.8, 0), 1.0))
	print(Vector3(1, 0, 0).rotated(Vector3(0, 1, 0), PI / 2))
	quit()
