extends SceneTree

func _initialize():
	print("a|", JSON.stringify({"a": 1}))
	print("b|", JSON.parse_string('{"a": 1}'))
	quit()
