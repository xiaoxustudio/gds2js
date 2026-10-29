extends SceneTree

func _initialize():
	var n := Node3D.new()
	print("a|", str(n.global_rotation_degrees), "|", str(n.global_scale), "|", str(n.global_basis))
	quit()
