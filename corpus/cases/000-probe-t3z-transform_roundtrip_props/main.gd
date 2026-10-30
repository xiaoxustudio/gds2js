extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.rotation = Vector3(0.1, 0.2, 0.3)
	var tr := n.transform
	tr.origin = Vector3(7, 8, 9)
	n.transform = tr
	print("a|", str(n.position), "|", str(n.rotation), "|", str(n.transform))
	quit()
