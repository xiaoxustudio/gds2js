extends SceneTree

func _initialize():
	print("a|", JSON.stringify({1: 2, 2.5: 3, true: 4}))
	quit()
