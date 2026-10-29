extends SceneTree

func _initialize():
	print("a|", str(Transform3D().transformed(Vector3(1, 2, 3))))
	quit()
