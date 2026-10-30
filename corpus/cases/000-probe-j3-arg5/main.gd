extends SceneTree

func _initialize():
	print("a|", JSON.stringify({"a": 1.0}, "", true, true, true))
	quit()
