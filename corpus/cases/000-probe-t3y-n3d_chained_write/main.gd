extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.position = Vector3(1, 2, 3)
	var tr := n.transform
	tr.origin = Vector3(9, 9, 9)
	print("a|", str(tr), "|", str(n.transform), "|", str(n.position))
	quit()
