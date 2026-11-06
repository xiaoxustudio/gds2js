extends SceneTree
func _initialize():
	print("d0|", Projection.create_depth_correction(false))
	print("d1|", Projection.create_depth_correction(true))
	print("l|", Projection.create_light_atlas_rect(Rect2(1, 2, 3, 4)))
	quit()
