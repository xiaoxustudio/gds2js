extends SceneTree

func _initialize():
	var n := Node3D.new()
	for i in range(3):
		var a := [0.4, 1.570795, -2.0][i]
		n.transform = Transform3D(Basis(Vector3(cos(a), 0.0, -sin(a)), Vector3(0.0, 1.0, 0.0), Vector3(sin(a), 0.0, cos(a))), Vector3(0, 0, 0))
		print("y|", i, "|", str(n.rotation), "|", str(n.scale))
	quit()
