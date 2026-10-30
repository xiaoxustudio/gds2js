extends SceneTree

func _initialize():
	var d := {"a": [1, [2, 3]], "e": {}, "f": [], "g": {"h": {"i": 1}}}
	print("a|", JSON.stringify(d, "  "))
	print("b|", JSON.stringify(d, "\t"))
	print("c|", JSON.stringify(d, ""))
	print("d|", JSON.stringify([1, 2], " "))
	quit()
