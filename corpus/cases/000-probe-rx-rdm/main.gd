extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("(\\w+)@(\\w+)")
	var s = r.search("mail bob@site x")
	print("a|", s.get_class(), "|", s is RegExMatch, "|", s is RefCounted, "|", s is Object, "|", s.is_class("RegExMatch"), "|", typeof(s))
	print("b|", str(s))
	var names := []
	for e in s.get_method_list():
		names.append(e["name"])
	names.sort()
	print("m|", ";".join(names))
	print("c|", s.get_string(0), "|", s.get_string(1), "|", s.get_string(2), "|", s.get_group_count(), "|", s.get_start(0), "|", s.get_end(0))
	var t = r.search("zzz")
	print("d|", t == null, "|", typeof(t))
	quit()
