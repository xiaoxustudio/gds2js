extends SceneTree

func _initialize():
	print(clamp(Vector2(1, 2), 1, Vector2(1, 2)))
	print(clamp(Vector2(1, 2), Vector2(1, 2), 1))
	print(lerp(Vector2(1, 2), 1, Vector2(1, 2)))
	print(snapped(Vector2(1, 2), 1))
	print(clamp(Color(1, 0, 0, 1), 1, Color(1, 0, 0, 1)))
	print(lerp(Color(1, 0, 0, 1), 1, Color(1, 0, 0, 1)))
	print(clamp(Vector3(1, 2, 3), 1, Vector3(1, 2, 3)))
	print(clamp(Vector3(1, 2, 3), Vector3(1, 2, 3), 1))
	print(lerp(Vector3(1, 2, 3), 1, Vector3(1, 2, 3)))
	print(snapped(Vector3(1, 2, 3), 1))
	quit()
