extends SceneTree

func _initialize():
	print("a|", JSON.parse_string('{"a": 1, "a": 2}'))
	quit()
