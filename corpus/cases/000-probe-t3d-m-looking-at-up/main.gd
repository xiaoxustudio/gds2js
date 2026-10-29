extends SceneTree

func _initialize():
	print("a|", str(Transform3D().looking_at(Vector3(1, 2, 3), Vector3(1, 0, 0))))
	quit()
