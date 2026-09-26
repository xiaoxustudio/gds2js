extends SceneTree

func _initialize():
	var a = [1, 2]
	print("n1 ", a.insert(0, 9), " ", a)
	print("n2 ", a.insert(99, 8), " ", a)
	print("n3 ", a.insert(-99, 8), " ", a)
	print("n4 ", a.insert(3, 7), " ", a)
	print("n5 ", a.resize(6), " ", a)
	print("n6 ", a.resize(6), " ", a.size())
	print("n7 ", a.resize(2), " ", a)
	var t: Array[int] = [1, 2]
	print("n8 ", t.insert(0, "s"), " ", t)
	print("n9 ", t.insert(1, 5), " ", t)
	var b = [1, 2, 3]
	print("n10 ", b.pop_back(), " ", b.pop_front(), " ", b)
	var c = [7, 8, 9]
	print("n11 ", c.pop_at(1), " ", c)
	var e = [1, 2, 1]
	e.erase(1)
	print("n12 ", e)
	var d = {1: 2}
	print("n13 ", d.erase(1), " ", d.erase(9), " ", d)
	quit()
