extends SceneTree

func _initialize():
	var n := Node3D.new()
	n.transform = Transform3D(Basis(Vector3(0.5, 0.5, 0.7071068), Vector3(-0.7071068, 0.7071068, 0.0), Vector3(-0.5, -0.5, 0.7071068)), Vector3(1, 1, 1))
	print("a|", str(n.rotation), "|", str(n.scale), "|", str(n.position))
	quit()
