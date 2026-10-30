extends SceneTree

func _initialize():
	var j: Variant = JSON.new()
	print("a|", j.stringify({"a": 1}), "|", j.parse_string('{"a": 1}'), "|", j.get_error_message())
	quit()
