extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(2, 1, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3(1, 2, 3))
	print("a|", str(n.rotation), "|", str(n.scale), "|", str(n.position), "|", str(n.rotation_degrees))
	quit()
