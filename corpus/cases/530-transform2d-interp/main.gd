extends SceneTree
func _initialize():
	var a := Transform2D(Vector2(0.5, 0.2), Vector2(-0.3, 1.2), Vector2(4, 5))
	var b := Transform2D(Vector2(0, 1), Vector2(-1, 0), Vector2(10, 20))
	print("i|", a.interpolate_with(b, 0.5))
	quit()
