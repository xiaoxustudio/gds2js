extends SceneTree

func _initialize():
	var n := Node.new()
	print("n1|", n.get_scene_file_path(), "|", n.get_process_priority(), "|", n.get_physics_process_priority())
	n.set_scene_file_path("res://x.gd")
	n.set_process_priority(3)
	n.set_physics_process_priority(4)
	n.scene_file_path = "res://y.gd"
	n.process_priority = 5
	n.process_physics_priority = 6
	print("n2|", n.get_scene_file_path(), "|", n.scene_file_path, "|", n.get_process_priority(), "|", n.process_priority)
	print("n3|", n.get_physics_process_priority(), "|", n.process_physics_priority, "|", n.process_mode)
	print("n4|", n.is_processing_internal(), "|", n.is_physics_processing_internal(), "|", n.is_physics_interpolated(), "|", n.is_physics_interpolated_and_enabled(), "|", n.is_displayed_folded())
	n.free()
	quit()
