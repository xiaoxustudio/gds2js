extends SceneTree

func _initialize():
	print("r ", str("a", "-", "b"), " | ", str(1, 2, 3), " | ", str("x", null, 2.5))
	print("r2 ", str(1.7), " ", str(-0.0), " ", str([1, 2]), " ", str(Vector2(1.5, 2)))
	print("r3 ", str(Vector2(1.5, 2), "+", 7), " ", String("ok"))
	quit()
