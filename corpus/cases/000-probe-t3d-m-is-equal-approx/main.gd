extends SceneTree

func _initialize():
	print("a|", str(Transform3D().is_equal_approx(Transform3D())))
	quit()
