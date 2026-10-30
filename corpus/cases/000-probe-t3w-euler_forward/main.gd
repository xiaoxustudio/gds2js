extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.rotation = Vector3(0.3, -0.4, 0.5)
	print("a|", str(n.transform), "|", str(n.basis))
	quit()
