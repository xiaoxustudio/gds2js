extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.parse("{"))
	print("b|", j.get_error_message(), "|", j.get_error_line())
	print("c|", j.parse('[1,\n2,\nx]'))
	print("d|", j.get_error_message(), "|", j.get_error_line())
	print("e|", j.parse('{"a": 1}'), "|", j.get_error_message(), "|", j.get_error_line(), "|", j.get_data())
	quit()
