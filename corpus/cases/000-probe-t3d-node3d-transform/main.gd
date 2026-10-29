extends SceneTree

func _initialize():
	var n := Node3D.new()
	print("a|", str(n.transform), "|", str(n.global_position), "|", str(n.global_rotation), "|", str(n.get_global_transform()))
	quit()
