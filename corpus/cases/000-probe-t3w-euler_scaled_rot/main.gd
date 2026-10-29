extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(2, 2, 0), Vector3(-2, 2, 0), Vector3(0, 0, 3)), Vector3(0, 0, 0))
	print("a|", str(n.rotation), "|", str(n.scale), "|", str(n.basis))
	quit()
