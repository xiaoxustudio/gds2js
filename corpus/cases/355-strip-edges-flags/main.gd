extends SceneTree

func _initialize():
	var s: String = "  abc  "
	print("A|", s.strip_edges(), "|", s.strip_edges(true), "|", s.strip_edges(false), "|", s.strip_edges(true, true))
	print("B|", s.strip_edges(true, false), "|", s.strip_edges(false, true), "|", s.strip_edges(false, false), "|", s.strip_edges(1, false))
	var n := "  x  "
	print("C|", n.strip_edges(1, 0), "|", n.strip_edges(0, 1), "|", n.strip_edges(0, 0), "|", n.strip_edges(2, 2), "|", n.strip_edges(-1, -1))
	print("D|", n.strip_edges(0.5, 0.0), "|", n.strip_edges(1.5, 1.5), "|", n.strip_edges(0.0, 0.0))
	var t: String = "\ta\tb\t"
	print("E|", t.strip_edges(), "|", t.strip_edges(false, true), "|", t.strip_edges(true, false))
	var u: String = "xabcx"
	print("F|", u.strip_edges(true, 1), "|", u.strip_edges(false, false), "|", u.strip_edges())
	print("G|", " \u0001a ".strip_edges().length(), "|", " \u0001a ".strip_edges(false, true).length(), "|", " ".strip_edges(false, false).length())
	var y: String = char(1) + "  abc  "
	print("H|", y.strip_edges().length(), "|", y.strip_edges(false, true).length(), "|", y.strip_edges(true, false).length())
	print("I|", "\u00a0abc".strip_edges().length(), "|", "\u00a0abc ".strip_edges(false, true).length(), "|", "abc".strip_edges(true, false))
	quit()
