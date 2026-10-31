extends SceneTree

func _initialize():
	var r = RegEx.new()
	print("a|", r.is_valid(), "|", r.get_pattern(), "|", r.get_names(), "|", r.get_group_count())
	var s = r.search("abc")
	print("b|", s == null, "|", typeof(s))
	var l = r.search_all("abc")
	print("c|", l.size(), "|", l)
	print("d|", r.sub("abc", "#"))
	r.clear()
	print("e|", r.is_valid(), "|", r.get_pattern())
	print("f|", r.compile("(a)"), "|", r.get_group_count(), "|", r.get_names())
	print("g|", r.compile("("), "|", r.is_valid(), "|", r.get_pattern(), "|", r.get_group_count())
	var q = RegEx.new()
	q.compile("(")
	print("h|", q.compile("z"), "|", q.is_valid(), "|", q.get_pattern())
	quit()
