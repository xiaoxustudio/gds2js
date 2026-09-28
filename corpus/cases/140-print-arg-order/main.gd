extends SceneTree

func _initialize():
	var a = [1, 2, 3]
	print("o1 ", a, a.pop_back(), a)
	var d = {"k": 1, "j": 2}
	print("o2 ", d, d.erase("k"), d, d.size())
	var r = PackedInt32Array([7])
	print("o3 ", r, r.append(9), r)
	var s = "ab"
	print("o4 ", s, s + "c", s)
	quit()
