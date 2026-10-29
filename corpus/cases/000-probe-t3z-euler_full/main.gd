extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.position = Vector3(1, 2, 3)
	n.rotation = Vector3(0.3, -0.4, 0.5)
	n.scale = Vector3(2, 0.5, 3)
	print("a|", str(n.transform))
	print("b|", str(n.basis), "|", str(n.rotation_degrees))
	quit()
