extends SceneTree

func _initialize():
	var d := {"b": 1, "a": {"z": 2, "y": [3, 4]}}
	print("a|", JSON.stringify(d, "", "  "))
	quit()
