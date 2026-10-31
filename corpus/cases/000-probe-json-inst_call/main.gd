extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.stringify({"a": 1}))
	print("b|", j.parse_string('{"a": 1}'), "|", j.get_error_message())
	quit()
