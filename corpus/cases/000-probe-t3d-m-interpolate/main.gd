extends SceneTree

func _initialize():
	var a := Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 2, 0), Vector3(0, 0, 2)), Vector3(1, 2, 3))
	print("a|", str(a.interpolate_with(Transform3D(), 0.5)))
	quit()
