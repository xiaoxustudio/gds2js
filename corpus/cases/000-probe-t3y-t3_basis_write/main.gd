extends SceneTree

func _initialize():
	var t := Transform3D()
	t.basis = Basis(Vector3(5, 0, 0), Vector3(0, 6, 0), Vector3(0, 0, 7))
	print("a|", str(t), "|", str(t.basis.x), "|", t.basis.z.z)
	quit()
