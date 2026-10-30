extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.position = Vector3(1, 2, 3)
	n.rotation = Vector3(0.1, 0.2, 0.3)
	n.scale = Vector3(2, 2, 2)
	print("a|", str(n.transform), "|", str(n.transform.basis), "|", str(n.transform.origin), "|", n.transform == n.rotation)
	quit()
