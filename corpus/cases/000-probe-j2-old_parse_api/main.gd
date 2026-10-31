extends SceneTree

func _initialize():
	var j := JSON.new()
	print("a|", j.parse("{"), "|", j.get_data())
	print("b|", j.parse("{\"a\": 1}"), "|", j.get_data())
	quit()
