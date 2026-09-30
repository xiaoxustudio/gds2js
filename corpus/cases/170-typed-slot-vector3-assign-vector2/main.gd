extends SceneTree

func _initialize():
	var v: Vector3 = Vector3i(1, 2, 3)
	v = Vector2(1, 2)
	print("never ")
	quit()
