extends SceneTree

func _initialize():
	var d := {"b": 1, "a": {"z": 2, "y": [3]}}
	print("a|", JSON.stringify(d))
	print("b|", JSON.stringify(d, "", "\t"))
	print("c|", JSON.stringify(d, "  ", ""))
	print("d|", JSON.stringify(d, "", "  ", true, true, true))
	quit()
