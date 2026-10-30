extends SceneTree

func _initialize():
	print("a|", JSON.parse_string('true'), "|", JSON.parse_string('null'), "|", JSON.parse_string('5'), "|", JSON.parse_string('5.0'), "|", JSON.parse_string('"s"'), "|", JSON.parse_string('[]'))
	print("b|", JSON.parse_string(''), "|", JSON.parse_string(' 1 '), "|", JSON.parse_string('1 2'))
	quit()
