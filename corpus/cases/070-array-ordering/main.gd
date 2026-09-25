extends SceneTree

func _initialize():
	var a = [3, 1, 2]
	a.sort()
	print(a)
	var f = [2.5, 1, 3.0, 2]
	f.sort()
	print(f)
	var s = ["b", "a", "C"]
	s.sort()
	print(s)
	var n = [2, -2, 0, -1, 1]
	n.sort()
	print(n)
	var e = []
	e.sort()
	print(e)
	var b = [true, false, true]
	b.sort()
	print(b)
	var big = [9007199254740993, 9007199254740992, 1]
	big.sort()
	print(big)
	var v = [Vector2(1, 2), Vector2(0, 3)]
	v.sort()
	print(v)
	var t = [3, 1, 2]
	t.sort_custom(func(x, y): return x < y)
	print(t)
	var u = [3, 1, 2]
	u.sort_custom(func(x, y): return x > y)
	print(u)
	var pairs = [[1, "a"], [2, "b"], [1, "c"], [2, "d"], [1, "e"]]
	pairs.sort_custom(func(x, y): return x[0] < y[0])
	print(pairs)
	var words = ["pear", "apple", "fig"]
	words.sort_custom(func(x, y): return x > y)
	print(words)
	var vs = [Vector2(0, 3), Vector2(1, 1), Vector2(-2, 5)]
	vs.sort_custom(func(x, y): return x.y < y.y)
	print(vs)
	var one = [5]
	one.sort_custom(func(x, y): return x < y)
	print(one)
	print(n.min())
	print(n.max())
	print([].min())
	print([].max())
	print([1, 3, 5].bsearch(3))
	print([1, 3, 5].bsearch(4))
	print([3, 1, 2].bsearch(99))
	print([3, 1, 2].bsearch(2))
	print([2, 1].bsearch_custom(2, func(x, y): return x < y))
	print(["b", "a", "c"].bsearch("b"))
	print([3, 1, 2].find(3))
	print([3, 1, 2].find(9))
	print([[1, 2], [3, 4]].find([3, 4]))
	print([3, 1, 2].count(3))
	print([].count(1))
	quit()
