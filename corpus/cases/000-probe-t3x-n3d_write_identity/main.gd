extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3(5, 6, 7))
	print("a|", str(n.position), "|", str(n.rotation), "|", str(n.scale), "|", str(n.basis))
	quit()
