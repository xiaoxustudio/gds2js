extends SceneTree

func _initialize():
	var n := Node3D.new()
	for i in range(4):
		var a := [0.0, 0.785398, -1.2, 3.0][i]
		n.transform = Transform3D(Basis(Vector3(cos(a), sin(a), 0.0), Vector3(-sin(a), cos(a), 0.0), Vector3(0.0, 0.0, 1.0)), Vector3(0, 0, 0))
		print("z|", i, "|", str(n.rotation), "|", str(n.scale))
	quit()
