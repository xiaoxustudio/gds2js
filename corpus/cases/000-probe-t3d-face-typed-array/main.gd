extends SceneTree

func _initialize():
	var arr: Array[Transform3D] = [Transform3D(), Transform3D()]
	var z: Transform3D
	print("a|", arr.size(), "|", str(z), "|", z == Transform3D(), "|", z is Transform3D)
	quit()
