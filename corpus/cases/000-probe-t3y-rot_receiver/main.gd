extends SceneTree

func _initialize():
	var b := Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4))
	var t := Transform3D(b, Vector3(1, 2, 3))
	print("a|", str(t.rotated(Vector3(0, 1, 0), 0.5)), "|", str(t.rotated(Vector3(0, 1, 0), 0.5).origin))
	quit()
