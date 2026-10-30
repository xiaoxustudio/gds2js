extends SceneTree

func _initialize():
	var a := Transform3D(Basis(Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(0, 0, 0))
	var b := Transform3D(Basis(Vector3(1.000001, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(0, 0, 0))
	var c := Transform3D(Basis(Vector3(1.00001, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(0, 0, 0))
	var d := Transform3D(Basis(Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)), Vector3(0.00001, 0, 0))
	print("a|", a.is_equal_approx(b), "|", a.is_equal_approx(c), "|", a.is_equal_approx(d), "|", a.is_equal_approx(a))
	quit()
