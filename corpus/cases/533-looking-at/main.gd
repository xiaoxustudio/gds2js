extends SceneTree
func _initialize():
	print("b|", Basis().looking_at(Vector3(0, 0, -1)))
	print("b2|", Basis().looking_at(Vector3(1, 0, 0)))
	var t := Transform3D(Basis(), Vector3(0, 0, 5))
	print("t|", t.looking_at(Vector3(0, 0, 0)))
	print("t2|", t.looking_at(Vector3(0, 0, 0), Vector3.UP, true))
	var a := Transform2D(Vector2(1, 0), Vector2(0, 1), Vector2(0, 0))
	print("2d|", a.looking_at(Vector2(1, 1)))
	quit()
