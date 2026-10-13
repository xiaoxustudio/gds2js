extends SceneTree

func _initialize():
	var a: Array = [1, 2, 3]
	print("A|", a.bsearch(0), "|", a.bsearch(1), "|", a.bsearch(2), "|", a.bsearch(3), "|", a.bsearch(4))
	var b: Array = [1, 3, 5, 7]
	print("B|", b.bsearch(2), "|", b.bsearch(4), "|", b.bsearch(6), "|", b.bsearch(8))
	print("C|", b.bsearch(2, false), "|", b.bsearch(4, false), "|", b.bsearch(6, false), "|", b.bsearch(1, false), "|", b.bsearch(7, false))
	var d: Array = [1, 1, 2, 2, 3, 3]
	print("D|", d.bsearch(1), "|", d.bsearch(2), "|", d.bsearch(3), "|", d.bsearch(1, false), "|", d.bsearch(2, false), "|", d.bsearch(3, false))
	var e: Array = [1, 2]
	print("E|", e.bsearch("a"), "|", e.bsearch("a", false), "|", e.bsearch(null), "|", e.bsearch([9]), "|", e.bsearch(Color(1, 0, 0, 1)))
	print("F|", e.bsearch(1, 1), "|", e.bsearch("a", 1), "|", e.bsearch(2, 0), "|", e.bsearch(2, 0.0), "|", e.bsearch(2, 1))
	var g: Array = [3, 1, 2]
	print("G|", g.bsearch(1), "|", g.bsearch(2), "|", g.bsearch(3), "|", g.bsearch(2, false))
	print("H|", a.bsearch_custom(2, func(x, y): return x < y), "|", a.bsearch_custom(2, func(x, y): return x > y))
	print("I|", a.bsearch_custom(2, func(x, y): return x < y, false), "|", a.bsearch_custom(2, func(x, y): return x > y, false), "|", a.bsearch_custom(1, func(x, y): return x > y, true))
	var s: String = "abc"
	print("J|", [1, 2, 3].bsearch(1.5), "|", [1, 2, 3].bsearch(true, false), "|", [1, 2, 3].bsearch(^"a"), "|", [1, 2, 3].bsearch(&"a", false), "|", s.length())
	quit()
