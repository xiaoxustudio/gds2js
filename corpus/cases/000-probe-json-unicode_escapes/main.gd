extends SceneTree

func _initialize():
	print("a|", JSON.stringify({"k": "é中"}))
	print("b|", JSON.stringify(["a\"b", "a\\b", "a/b", "a\nb", "a\u0001b", "tab\tb"]))
	quit()
