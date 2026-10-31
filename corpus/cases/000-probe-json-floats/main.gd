extends SceneTree

func _initialize():
	print("a|", JSON.stringify({"v": 1.0}))
	print("b|", JSON.stringify([0.1, 1.0e20, 1.0e-20, 1.0 / 0.0, -1.0 / 0.0]))
	print("c|", JSON.stringify([3.5, 100000000000.0, 0.000001]))
	quit()
