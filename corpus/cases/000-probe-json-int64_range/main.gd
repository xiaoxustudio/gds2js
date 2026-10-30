extends SceneTree

func _initialize():
	print("a|", JSON.stringify([9007199254740993, -9007199254740993]))
	print("b|", JSON.parse_string('[9007199254740993]'))
	quit()
