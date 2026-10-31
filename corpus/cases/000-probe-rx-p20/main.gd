extends SceneTree

func _initialize():
	var r = RegEx.new()
	var code = r.compile("\\$\\d+")
	var v := "a $5"
	print("p|", "\\$\\d+", "|", code, "|", r.is_valid(), "|", r.get_pattern(), "|", r.get_names(), "|", r.get_group_count())
	var s = r.search(v)
	if s != null:
		print("a|", s.get_start(), "|", s.get_end(), "|", s.get_string(), "|", s.get_group_count(), "|", s.get_strings())
	else:
		print("a|nil")
	var o = r.search(v, 2)
	if o != null:
		print("o|", o.get_start(), "|", o.get_end(), "|", o.get_string())
	else:
		print("o|nil")
	var list := []
	for e in r.search_all(v):
		list.append([e.get_start(), e.get_end(), e.get_string()])
	print("b|", list)
	print("d|", r.sub(v, "#"), "|", r.sub(v, "#", 1), "|", r.sub(v, "[$0]", 1), "|", r.sub(v, "<$1>", 1))
	quit()
