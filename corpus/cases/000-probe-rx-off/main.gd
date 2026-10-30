extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("\\w+")
	var v := "aa bb cc"
	var list := []
	for e in r.search_all(v, 3):
		list.append([e.get_start(), e.get_string()])
	print("a|", list)
	print("b|", r.sub(v, "#", 0, 3), "|", r.sub(v, "#", 3, 3))
	print("c|", r.search(v, 6).get_start(), "|", r.search(v, 9).get_start())
	quit()
