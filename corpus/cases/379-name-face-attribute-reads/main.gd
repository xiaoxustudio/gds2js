extends SceneTree

func _initialize():
	var s: StringName = StringName("ab")
	print("W1|", s.hash, " ", s.hash.call())
	print("W2|", s.to_upper.call(), " ", s.is_empty())
	var n: NodePath = NodePath("a/b")
	print("W3|", n.hash, " ", n.hash.is_valid())
	print("W4|", n.get_name_count, " ", n.get_name_count.call(), " ", n.is_empty.call())
	var v: Vector3i = Vector3i(1, 2, 2)
	print("W5|", v.length, " ", v.length.call(), " ", v.z)
	var c: Color = Color(1, 0.5, 0.25, 1)
	print("W6|", c.to_html.call(), " ", c.r, " ", c.darkened.call(0.5))
	print("W7|", StringName("zz").to_upper.call())
	quit()
