extends SceneTree

func _initialize():
	var t := Transform3D()
	t.origin = Vector3(1, 2, 3)
	t.basis = Basis(Vector3(2, 0, 0), Vector3(0, 2, 0), Vector3(0, 0, 2))
	print("a|", str(t))
	quit()
