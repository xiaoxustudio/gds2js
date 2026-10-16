extends SceneTree

func _initialize():
	var a = [1, 2]
	var c = a.append
	print("C1|", c)
	print("C2|", c == a.append)
	var z = [7]
	print("C3|", c == z.append)
	c.call(9)
	print("C4|", a)
	var s = "abcd"
	print("C5|", s.to_upper, " ", s.to_upper.call())
	print("C6|", c.get_method(), " ", c.get_object(), " ", c.is_valid(), " ", c.is_null())
	print("C7|", c.get_argument_count(), " ", a.size.get_argument_count())
	quit()
