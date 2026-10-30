extends SceneTree

func _initialize():
	var b := Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10))
	var t := Transform3D(b, Vector3(11, 12, 13))
	var u := Transform3D(Basis(Vector3(0.6, 0.0, 0.0), Vector3(0.0, 0.8, 0.0), Vector3(0.0, 0.0, 1.0)), Vector3(1, 2, 3))
	print("a|", t == u, "|", t == t, "|", t == Transform3D(), "|", t == t.basis, "|", t == Vector3(1, 2, 3), "|", t == 1, "|", t != u)
	quit()
