extends SceneTree

func _initialize():
	var r = RegEx.new()
	print("a|", r.create_from_string("(a)(b)", true), "|", r.is_valid(), "|", r.get_pattern(), "|", r.get_group_count(), "|", r.get_names())
	var s = r.search("xy")
	print("b|", s != null, "|", s.get_strings())
	print("c|", r.create_from_string("(", true), "|", r.is_valid())
	var d = RegEx.new()
	print("d|", d.create_from_string("(?<n>a)z", false), "|", d.get_names(), "|", d.get_pattern())
	var e = RegEx.new()
	print("e|", e.create_from_string("ABC", true), "|", e.search("zzzabc") == null, "|", e.search("zzzABC") != null)
	quit()
