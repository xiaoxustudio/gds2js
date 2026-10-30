extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(0, 0, 1), Vector3(0, 1, 0), Vector3(-1, 0, 0)), Vector3(7, 8, 9))
	print("a|", str(n.rotation), "|", str(n.rotation_degrees), "|", str(n.scale), "|", str(n.position))
	quit()
