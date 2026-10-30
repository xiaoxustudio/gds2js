extends SceneTree

func _initialize():
	print("a|", str(Transform3D().looking_at(Vector3(0, 0, -5))))
	print("b|", str(Transform3D().looking_at(Vector3(5, 0, 0))))
	print("c|", str(Transform3D().looking_at(Vector3(1, 1, 1))))
	print("d|", str(Transform3D().looking_at(Vector3(0, 5, 0))))
	print("e|", str(Transform3D().looking_at(Vector3(0, 0, 0))))
	print("f|", str(Transform3D(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10), Vector3(1, 1, 1)).looking_at(Vector3(2, 2, 2))))
	quit()
