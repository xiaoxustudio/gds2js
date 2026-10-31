extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("(?<head>\\w+): (?<tail>\\w+)")
	var s = r.search("xx head: yy tail zz", 3)
	print("a|", s.get_subject(), "|", s.get_names(), "|", s.get_group_count(), "|", s.get_start(), "|", s.get_end(), "|", s.get_string())
	print("b|", s.get_string(1), "|", s.get_string(2), "|", s.get_string(3), "|", s.get_start(1), "|", s.get_end(2))
	print("c|", s.get_start(3), "|", s.get_end(3), "|", s.get_strings())
	var t = RegEx.new()
	t.compile("(a)?b")
	var u = t.search("b")
	print("d|", u.get_strings(), "|", u.get_string(1), "|", u.get_start(1), "|", u.get_end(1))
	quit()
