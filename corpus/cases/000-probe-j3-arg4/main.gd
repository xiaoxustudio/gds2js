extends SceneTree

func _initialize():
	var d := {"a": 1.0, "b": [0.1, 1.0 / 3.0, 1.0e20]}
	print("a|", JSON.stringify(d, "", true, true))
	print("b|", JSON.stringify(d, "", true, false))
	print("c|", JSON.stringify(d, "", false, true))
	quit()
