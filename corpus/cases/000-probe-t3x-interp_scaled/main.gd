extends SceneTree

func _initialize():
	var a := Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 2, 0), Vector3(0, 0, 2)), Vector3(1, 1, 1))
	var b := Transform3D(Basis(Vector3(4, 0, 0), Vector3(0, 4, 0), Vector3(0, 0, 4)), Vector3(5, 5, 5))
	print("a|", str(a.interpolate_with(b, 0.5)))
	quit()
