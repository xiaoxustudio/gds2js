extends SceneTree

func _initialize():
	var a: Array = [1, 2]
	var c = a.append
	print("T1|", c)
	print("T2|", c == a.append)
	print("T3|", c.is_valid(), " ", c.get_method(), " ", c.get_object())
	c.call(9)
	print("T4|", a)
	var s: String = "abcd"
	print("T5|", s.to_upper, " ", s.to_upper.call())
	var p: PackedByteArray = PackedByteArray([1, 2])
	print("T6|", p.size, " ", p.size.call())
	quit()
