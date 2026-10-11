extends SceneTree

func _initialize():
	for a in [Vector2(0, 0), Vector2(1, 1), Vector2(-4, 8), Vector2(0.1, 0.2), Vector2(3, 4), Vector2(10000000, 20000000)]:
		print("MT2|", a, "|", a.move_toward(Vector2(10, 0), 3.0), "|", a.move_toward(Vector2(1, 1), 5.0), "|", a.move_toward(Vector2(7.7, -3.3), 4.9), "|", a.move_toward(Vector2(7.7, -3.3), 12.0))
	print("MT2X|", Vector2(0.5, -0.25).move_toward(Vector2(-7.25, 6.125), 0.375), "|", Vector2(0.5, -0.25).move_toward(Vector2(-7.25, 6.125), 100.0), "|", Vector2(1e7, 2e7).move_toward(Vector2(1e7 + 1, 2e7 + 1), 0.5))
	print("MT2Y|", Vector2(-4, 8).move_toward(Vector2(1, 1), 2.0), "|", Vector2(-4, 8).move_toward(Vector2(1, 1), 8.6), "|", Vector2(-4, 8).move_toward(Vector2(1, 1), 8.602325))
	quit()
