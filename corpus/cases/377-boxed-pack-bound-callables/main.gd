extends SceneTree

func _initialize():
	var p = PackedStringArray(["a", "b"])
	var c = p.size
	print("B1|", c)
	print("B2|", c.call())
	print("B3|", c.get_method(), " ", c.get_object(), " ", c.get_argument_count(), " ", c.is_valid())
	var q = PackedByteArray([1, 2])
	print("B4|", q.count, " ", q.count.call(2))
	print("B5|", p.append, " ", p.append == PackedStringArray(["a"]).append)
	quit()
