extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.global_position = Vector3(1, 2, 3)
	print("a|", str(n.position))
	quit()
