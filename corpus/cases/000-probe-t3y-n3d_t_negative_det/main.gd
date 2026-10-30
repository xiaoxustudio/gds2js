extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, -3, 0), Vector3(0, 0, 4)), Vector3(1, 1, 1))
	print("a|", str(n.scale), "|", str(n.rotation), "|", str(n.basis))
	quit()
