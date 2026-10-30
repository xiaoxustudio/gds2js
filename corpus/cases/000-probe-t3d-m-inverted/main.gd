extends SceneTree

func _initialize():
	print("a|", str(Transform3D().inverted()))
	quit()
