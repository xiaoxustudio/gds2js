extends SceneTree

func _initialize():
	print("a|", JSON.parse_string('[[[[1]]]]'), "|", JSON.parse_string('{}'), "|", JSON.parse_string('[]'))
	print("b|", typeof(JSON.parse_string('1')), "|", typeof(JSON.parse_string('[1]')[0]))
	print("c|", JSON.parse_string('"\\u0041"'))
	quit()
