extends SceneTree

func _initialize():
	var n := Node3D.new()
	for i in range(3):
		var a := [0.5, -0.9, 1.570795][i]
		n.transform = Transform3D(Basis(Vector3(1.0, 0.0, 0.0), Vector3(0.0, cos(a), sin(a)), Vector3(0.0, -sin(a), cos(a))), Vector3(0, 0, 0))
		print("x|", i, "|", str(n.rotation), "|", str(n.scale))
	quit()
