extends SceneTree

func _initialize():
	var j := JSON.new()
	j.parse_string("{")
	print("a|", j.get_error_line())
	quit()
