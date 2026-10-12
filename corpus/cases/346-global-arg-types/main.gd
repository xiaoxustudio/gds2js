extends SceneTree

func _initialize():
	print(sqrt("a"))
	print(sqrt(Vector2(1, 2)))
	print(sqrt(null))
	print(char(&"a"))
	print(posmod("a", 2))
	print(absi(null))
	print(nearest_po2([]))
	print(wrap(1, 2, "a"))
	print(clamp(1.0, "a", 3.0))
	print(move_toward(1.0, "a", 0.5))
	print(deg_to_rad(Color(1, 2, 3, 4)))
	print(is_equal_approx(1.0, ^"a/b"))
	quit()
