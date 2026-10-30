extends SceneTree

func _initialize():
	var s := ""
	for i in range(300):
		s += "["
	for i in range(300):
		s += "]"
	print("a|", JSON.parse_string(s) == null, "|", s.length())
	var t := ""
	for i in range(64):
		t += "["
	for i in range(64):
		t += "]"
	print("b|", typeof(JSON.parse_string(t)))
	quit()
