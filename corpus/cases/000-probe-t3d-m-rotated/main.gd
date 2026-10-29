extends SceneTree

func _initialize():
	print("a|", str(Transform3D().rotated(Vector3(0, 1, 0), 0.5)))
	quit()
