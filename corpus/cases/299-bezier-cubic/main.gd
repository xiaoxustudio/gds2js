extends SceneTree

func _initialize():
	for v in [Vector2(1, 2), Vector2(-3, 0.5), Vector2(0, 0)]:
		print("BZ2|", v, "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.0), "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.25), "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.5), "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 1.0))
		print("CI2|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 0.0), "|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 0.3), "|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 1.0))
	for v in [Vector2(1, 2), Vector2(-3, 0.5)]:
		print("BZ2T|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.3), "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.7), "|", v.bezier_interpolate(Vector2(1, 4), Vector2(5, 5), Vector2(6, -2), 0.13))
		print("CI2T|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 0.7), "|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 0.13), "|", v.cubic_interpolate(Vector2(2, 3), Vector2(-4, 1), Vector2(9, -2), 0.37))
	for v in [Vector3(1, 2, 3), Vector3(-3, 0.5, 7), Vector3(0, 0, 0)]:
		print("BZ3|", v, "|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 0.25), "|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 0.5), "|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 1.0))
	for v in [Vector3(1, 2, 3), Vector3(-3, 0.5, 7)]:
		print("BZ3T|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 0.3), "|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 0.7), "|", v.bezier_interpolate(Vector3(1, 4, 0.5), Vector3(5, 5, -2), Vector3(6, -2, 9), 0.13))
	print("CI3|", Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 3, 4), Vector3(-4, 1, 0), Vector3(9, -2, 5), 0.3), "|", Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 3, 4), Vector3(-4, 1, 0), Vector3(9, -2, 5), 0.5))
	print("CI3T|", Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 3, 4), Vector3(-4, 1, 0), Vector3(9, -2, 5), 0.7), "|", Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 3, 4), Vector3(-4, 1, 0), Vector3(9, -2, 5), 0.13), "|", Vector3(1, 2, 3).cubic_interpolate(Vector3(2, 3, 4), Vector3(-4, 1, 0), Vector3(9, -2, 5), 0.37))
	quit()
