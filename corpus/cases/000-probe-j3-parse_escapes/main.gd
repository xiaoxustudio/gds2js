extends SceneTree

func _initialize():
	print("a|", JSON.parse_string('{"a": "x\\u00e9y"}'))
	print("b|", JSON.parse_string('["a\\/b", "c\\\\d", "e\\nf"]'))
	print("c|", JSON.parse_string('{"k": 1e5}'), "|", JSON.parse_string('[1E-3, -0, 007]'))
	quit()
