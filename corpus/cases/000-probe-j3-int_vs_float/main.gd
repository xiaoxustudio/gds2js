extends SceneTree

func _initialize():
	print("a|", JSON.stringify({"i": 5, "f": 5.0}))
	print("b|", typeof(JSON.parse_string('{"i": 5}')["i"]))
	quit()
