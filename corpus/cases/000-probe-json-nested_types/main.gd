extends SceneTree

func _initialize():
	print("a|", JSON.stringify([1, 2, [3, {"k": [true, false, null]}]]))
	print("b|", JSON.stringify({"int": 7, "neg": -7}))
	print("c|", JSON.stringify({"a": {}}))
	quit()
