extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("(\\w+)@(\\w+)")
	var s = r.search("mail bob@site x")
	print("a|", s != null, "|", typeof(s), "|", s.get_class(), "|", str(s))
	print("b|", s.get_start(), "|", s.get_end(), "|", s.get_string())
	print("c|", s.get_start(1), "|", s.get_end(1), "|", s.get_string(1), "|", s.get_string(2), "|", s.get_string(3))
	print("d|", s.get_group_count())
	quit()
