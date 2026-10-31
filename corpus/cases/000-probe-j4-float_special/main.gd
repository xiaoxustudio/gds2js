extends SceneTree

func _initialize():
	print("a|", JSON.stringify([1.0 / 0.0, -1.0 / 0.0]))
	print("b|", JSON.stringify([1.0 / 0.0], "", true, true))
	quit()
