extends SceneTree

func _initialize():
	var j := JSON.new()
	j.parse_string("[1,\n2,\nx]")
	print("a|", j.get_error_message(), "|", j.get_error_line(), "|", j.get_error_global_column())
	quit()
