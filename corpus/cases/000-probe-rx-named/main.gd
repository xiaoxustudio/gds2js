extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("(?<user>\\w+)@(?<host>\\w+)")
	print("a|", r.get_names(), "|", r.get_pattern(), "|", r.get_group_count())
	var s = r.search("mail bob@site x")
	print("b|", s.get_strings(), "|", s.get_string(1), "|", s.get_string(2))
	print("c|", r.sub("mail bob@site x", "[${user}]", 3), "|", r.sub("mail bob@site x", "<$1>", 3))
	var m = r.search("zzz")
	print("d|", m == null, "|", typeof(m))
	r.clear()
	print("e|", r.is_valid(), "|", r.get_pattern(), "|", r.get_names())
	quit()
