extends SceneTree

func _initialize():
	var arr: Array[String] = ["p", "q"]
	var sn: StringName = &"sep"
	var zn: StringName = &"z"
	var inner: Array = [1]
	var d: Dictionary = {"a": 1}
	var v2: Vector2 = Vector2(1, 2)
	var c: Color = Color(1, 0, 0, 1)
	var v3: Vector3 = Vector3(1, 2, 3)
	var v2i: Vector2i = Vector2i(3, 4)
	var fs: Array = [1.0 / 3.0, 1e20, 0.1 + 0.2, 1.0 / 0.0, -1.0 / 0.0]
	print("n1 [", (", ").join(["a", "b", "c"]), "]")
	print("n2 [", ("-").join([]), "] [", ("-").join(["x"]), "] [", ("").join(["a", "b"]), "]")
	print("n3 [", (", ").join(["a", "", "b"]), "] [", (", ").join(["", ""]), "]")
	print("n4 [", (", ").join([1, 2, 3]), "] [", (", ").join([true, false]), "]")
	print("n5 [", (", ").join([null]), "] [", (", ").join(["a", null]), "]")
	print("n6 [", (", ").join([v2, v2i]), "]")
	print("n7 [", ("| ").join([d, v2, c, v3]), "]")
	print("n8 [", ("|").join(arr), "] [", sn.join(["a", "b"]), "] [", (", ").join([zn, "y"]), "]")
	print("n9 [", (", ").join([inner, "a"]), "]")
	print("n10 [", (", ").join(fs), "]")
	var big: Array = []
	for i in range(200):
		big.append(i)
	print("n11 ", (",").join(big).length())
	print("n12 [", (", ").join([]), "] [", (", ").join(["only"]), "]")
	quit()
