extends SceneTree

func _initialize():
	print("a|", str(Transform3D().rotated(Vector3(1, 1, 1), 0.75)), "|", str(Transform3D().rotated(Vector3(0, 1, 0), -1.25)))
	quit()
