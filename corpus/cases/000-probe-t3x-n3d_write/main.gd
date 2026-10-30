extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10)), Vector3(11, 12, 13))
	print("a|", str(n.position), "|", str(n.rotation), "|", str(n.rotation_degrees), "|", str(n.scale), "|", str(n.basis), "|", str(n.transform))
	quit()
