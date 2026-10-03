extends SceneTree

func _initialize():
	var d3 = [[[1, 2], [3]], [[4], [5, 6]]]
	print("3d-print\t" + str(d3))
	print("3d-size\t" + str(d3.size()) + " " + str(d3[0].size()) + " " + str(d3[0][0].size()))
	var ragged = [[1, 2, 3], [4], [5, 6]]
	print("ragged-print\t" + str(ragged))
	print("ragged-eq\t" + str(ragged == [[1, 2, 3], [4], [5, 6]]) + " " + str(ragged == [[1], [2]]))
	print("deep-eq\t" + str(d3 == [[[1, 2], [3]], [[4], [5, 6]]]))
	var a = [1, [2, [3, [4, [5]]]]]
	print("nested-str\t" + str(a))
	print("nested-idx\t" + str(a[1][1][1][1]))
	var cyc: Array = []
	cyc.append(cyc)
	print("self-cyc-size\t" + str(cyc.size()))
	var m = {"a": {"b": {"c": [1, {"d": 2}]}}}
	print("dict-in\t" + str(m))
	print("dict-in-eq\t" + str(m == {"a": {"b": {"c": [1, {"d": 2}]}}}))
	var dup = a.duplicate(true)
	dup[1][1][1][1] = 99
	print("dup-deep\t" + str(a[1][1][1][1]) + " " + str(dup[1][1][1][1]))
	var shallow = a.duplicate(false)
	shallow[1][1][1][1] = 77
	print("dup-shallow\t" + str(a[1][1][1][1]))
	var t: Array[Array] = [[1], [2, 3]]
	print("typed-nested\t" + str(t) + " " + str(t.size()) + " " + str(t[1].size()))
	var pack: Array[PackedInt32Array] = [PackedInt32Array([1, 2]), PackedInt32Array()]
	print("typed-pack\t" + str(pack) + " " + str(pack[1].size()))
	quit()
