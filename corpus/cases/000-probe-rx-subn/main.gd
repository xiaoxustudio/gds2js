extends SceneTree

func _initialize():
	var r = RegEx.new()
	r.compile("[^,]+")
	var v := "a,bb,c"
	print("a|", r.sub(v, "#"), "|", r.sub(v, "#", 0), "|", r.sub(v, "#", 1))
	print("b|", r.sub(v, "#", 2), "|", r.sub(v, "#", 3), "|", r.sub(v, "#", 5), "|", r.sub(v, "#", -1))
	print("c|", r.sub(v, "[$0]", 3), "|", r.sub(v, "<$1>", 3), "|", r.sub(v, "${0}", 3))
	print("d|", r.sub(v, "$$", 3), "|", r.sub(v, "$&", 3), "|", r.sub(v, "q$z", 3))
	var g = RegEx.new()
	g.compile("(\\w+)")
	print("e|", g.sub("a b", "<$1>", 3), "|", g.sub("a b", "<${1}>", 3), "|", g.sub("a b", "$2", 3))
	print("f|", g.sub("a b", "$0$0", 3), "|", g.sub("a b", "[[$0]]", 1), "|", g.sub("a b", "${nope}", 3))
	print("g|", g.sub("a b", "", 3), "|", g.sub("xyz", "#", 3))
	quit()
