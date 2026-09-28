extends SceneTree

func _initialize():
	var s = PackedStringArray(["a", "b"])
	print("u1 ", s, " ", typeof(s), " ", s[0], " ", typeof(s[0]))
	var m = PackedStringArray([1, 2.5, true, null, &"nm"])
	print("u2 ", m)
	print("u3 ", s == PackedStringArray(["a", "b"]), " ", s + PackedStringArray(["c"]))
	print("u4 ", s[-1], "|", " ", s.get(9), "|", " ", s.has("a"), " ", s.find("b"), " ", s.count("a"))
	var t = PackedStringArray(["b", "a"])
	t.sort()
	print("u5 ", t, " ", t.slice(1), " ", t.duplicate() == t)
	var u = PackedStringArray()
	u.resize(2)
	print("u6 ", u)
	var added = u.append("x")
	print("u7 ", added, " ", u)
	u[0] = "z"
	print("u8 ", u, " ", u[-1])
	var d = PackedStringArray(["q"])
	var e = d
	e[0] = "w"
	print("u9 ", d, " ", d.insert(0, "i"), " ", d)
	var v: PackedStringArray
	print("u10 ", v, " ", v == PackedStringArray(), " ", v.size())
	quit()
