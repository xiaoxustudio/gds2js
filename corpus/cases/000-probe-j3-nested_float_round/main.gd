extends SceneTree

func _initialize():
	var d := {"a": 1.0 / 3.0}
	print("a|", JSON.stringify(d))
	print("b|", JSON.parse_string(JSON.stringify(d))["a"] == d["a"])
	quit()
