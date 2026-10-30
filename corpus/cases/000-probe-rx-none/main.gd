extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("zzz")
	var s = r.search("abc")
	print("a|", s, "|", s == null, "|", typeof(s), "|", str(s))
	var m = r.match("abc")
	print("b|", m == null, "|", str(m))
	print("c|", r.sub("abc", "#"), "|", r.split("abc"), "|", r.search_all("abc"), "|", r.match_all("abc"))
	print("d|", typeof(r.split("abc")), "|", typeof(r.search_all("abc")))
	quit()
