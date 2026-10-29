extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(0, -1, 0), Vector3(1, 0, 0), Vector3(0, 0, 1)), Vector3(1, 2, 3))
	print("a|", str(n.position), "|", str(n.rotation), "|", str(n.rotation_degrees), "|", str(n.scale), "|", str(n.basis))
	quit()
