extends SceneTree

func _initialize():
	print("a|", str(Transform3D().is_finite()))
	quit()
