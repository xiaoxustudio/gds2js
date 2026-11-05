extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.parse("{\"a\":1}", true), "|", j.get_data(), "|", j.get_error_line())
	print("b|", j.parse("{\"b\":2}", false), "|", j.get_data())
	quit()
