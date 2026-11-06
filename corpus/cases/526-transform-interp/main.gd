extends SceneTree
func _initialize():
	var t := Transform3D(Basis(), Vector3(0, 0, 0))
	var u := Transform3D(Basis(Vector3(0, 1, 0), PI / 2), Vector3(10, 20, 30))
	print("it|", t.interpolate_with(u, 0.5))
	quit()
