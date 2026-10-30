extends SceneTree

func _initialize():
	var z: Transform3D
	print("a|", str(z), "|", str(z.basis), "|", str(z.origin), "|", z != Transform3D())
	quit()
