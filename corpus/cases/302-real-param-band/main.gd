extends SceneTree

func _initialize():
	for w in [0.3, 0.13, 0.7, 0.37]:
		print("Q|", w, "|", Vector2(2.5, 40021.5).cubic_interpolate(Vector2(-0.7, 4.5), Vector2(0.3, -0.7), Vector2(2.5, 2.5), w))
		print("R|", w, "|", Vector2(1.5, 98765.4375).cubic_interpolate(Vector2(-2.5, 0.125), Vector2(0.25, -0.5), Vector2(-1.5, 2.25), w))
		print("S|", w, "|", Vector3(0.5, 12345.75, -1.25).cubic_interpolate(Vector3(1.5, -0.5, 2.5), Vector3(-2.5, 0.25, 1.5), Vector3(0.125, 3.5, -0.75), w))
		print("B|", w, "|", Vector2(2.5, 40021.5).bezier_interpolate(Vector2(-0.7, 4.5), Vector2(0.3, -0.7), Vector2(2.5, 2.5), w), "|", Vector3(0.5, 12345.75, -1.25).bezier_interpolate(Vector3(1.5, -0.5, 2.5), Vector3(-2.5, 0.25, 1.5), Vector3(0.125, 3.5, -0.75), w))
	print("T|", Vector2(1, 2).cubic_interpolate(Vector2(3, 4), Vector2(5, 6), Vector2(7, 8), 0.5), "|", Vector2(0.1, -0.2).cubic_interpolate(Vector2(0.3, -0.4), Vector2(0.5, -0.6), Vector2(0.7, -0.8), 0.7))
	print("W|", Vector2(0, 100000.0).cubic_interpolate(Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1), 0.25), "|", Vector3(0, 100000.0, -100000.0).cubic_interpolate(Vector3(1, -1, 2), Vector3(-1, 1, -2), Vector3(1, 1, 1), 0.25))
	print("L|", Vector2(2.5, 40021.5).lerp(Vector2(-0.7, 4.5), 0.3), "|", Vector2(2.5, 40021.5).snappedf(0.25), "|", Vector2(2.5, 40021.5).clampf(10000.5, 30000.25), "|", Vector2(2.5, 40021.5).move_toward(Vector2(-0.7, 4.5), 10000.5))
	print("C|", Color(0.1, 0.2, 0.3, 0.4).lightened(0.37), "|", Color(0.1, 0.2, 0.3, 0.4).darkened(0.13), "|", Color(0.1, 0.2, 0.3, 0.4).lerp(Color(0.9, 0.8, 0.7, 0.6), 0.37), "|", Color.from_hsv(0.13, 0.37, 0.7, 0.25))
	print("MT|", Vector3(-4, 8, -16).move_toward(Vector3(1, 1, 1), 2.0), "|", Vector3(-4, 8, -16).move_toward(Vector3(1, 1, 1), 0.7), "|", Vector3(1.5, -2.5, 3).move_toward(Vector3(-9, 4, 0.5), 11.0), "|", Vector3(0, 0, 0).move_toward(Vector3(-9, 4, 0.5), 100.0))
	print("MTX|", Vector3(2, -2, 2).move_toward(Vector3(2, -2, 2), 0.0), "|", Vector3(2, -2, 2).move_toward(Vector3(0, 0, 0), 0.0), "|", Vector3(1, 2, 3).move_toward(Vector3(4, 5, 6), -2.0), "|", Vector3(10000000.0, -20000000.0, 3000000.0).move_toward(Vector3(-1, 2, -3), 5.0))
	print("MTZ|", Vector3(0.1, 0.2, 0.3).move_toward(Vector3(1, 1, 1), 0.13), "|", Vector3(-3.5, 7.25, -0.125).move_toward(Vector3(0.5, 0.5, 0.5), 10000000.0), "|", Vector3(10000000.0, 20000000.0, -30000000.0).move_toward(Vector3(NAN, NAN, NAN), 0.5), "|", Vector3(NAN, 1, 2).move_toward(Vector3(1, 1, 1), 2.0), "|", Vector3(INF, 1, 2).move_toward(Vector3(1, 1, 1), 2.0), "|", Vector3(1, 2, 3).move_toward(Vector3(4, 5, 6), NAN))
	quit()
