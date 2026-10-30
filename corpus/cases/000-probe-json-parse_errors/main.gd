extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.parse_string("{"), "|", j.get_error_message(), "|", j.get_error_line(), "|", j.get_error_column(), "|", j.get_error_global_column())
	print("b|", j.parse_string('[1, ]'))
	print("c|", j.parse_string('nope'), "|", j.get_error_message())
	quit()
