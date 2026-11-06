extends SceneTree
func _initialize():
	print("ge|", Quaternion(0.1, 0.2, 0.3, 0.9).normalized().get_euler())
	quit()
