extends SceneTree
func _initialize():
	print("ph|", Projection.create_perspective_hmd(60.0, 1.777, 0.1, 100.0, false, 1, 0.06, 2.0))
	print("ph2|", Projection.create_perspective_hmd(60.0, 1.777, 0.1, 100.0, false, 2, 0.06, 2.0))
	print("fh|", Projection.create_for_hmd(1, 1.777, 0.06, 0.1, 0.05, 1.0, 0.1, 100.0))
	print("fh2|", Projection.create_for_hmd(2, 1.777, 0.06, 0.1, 0.05, 1.0, 0.1, 100.0))
	quit()
