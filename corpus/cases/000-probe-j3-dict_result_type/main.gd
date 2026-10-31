extends SceneTree

func _initialize():
	var v = JSON.parse_string('{"a": 1}')
	print("a|", typeof(v), "|", v is Dictionary, "|", v is Array, "|", str(v))
	var w = JSON.parse_string('[1]')
	print("b|", typeof(w), "|", w is Array, "|", str(w))
	quit()
