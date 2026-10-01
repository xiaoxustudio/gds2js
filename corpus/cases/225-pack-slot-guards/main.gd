extends SceneTree

func _initialize():
	var v = "x"
	v = 5
	var p = PackedByteArray([1, 2])
	print("r1 ", p.has(v), " ", p.has(2), " ", p.count(1))
	var q: PackedStringArray = PackedStringArray(["a"])
	print("r2 ", q.has("a"), " ", q.count("a"), " ", q.find("a"))
	print("r3 ", [1, 2].size(), " ", ("|").join([1, 2]))
	quit()
