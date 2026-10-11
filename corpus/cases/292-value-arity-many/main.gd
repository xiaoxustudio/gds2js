extends SceneTree

func _initialize():
	var s: Vector2i = Vector2i(3, 4)
	print("M|", s.snapped(Vector2i(1, 1), Vector2i(2, 2)))
	quit()
