extends SceneTree

func _initialize():
	var a := Rect2()
	var b := Rect2(Vector2(1, 2), Vector2(3, 4))
	var c := Rect2(1, 2, 3, 4)
	print("r01|", str(a), "|", str(b), "|", str(c))
	print("r02|", a.position, "|", a.size, "|", a.end)
	var d := Rect2()
	d.position = Vector2(5, 6)
	d.size = Vector2(7, 8)
	print("r03|", str(d), "|", str(d.end))
	var e := Rect2(0, 0, 4, 4)
	var f := Rect2(2, 2, 4, 4)
	print("r04|", e == Rect2(0, 0, 4, 4), "|", e == f, "|", e != f, "|", typeof(e))
	print("r05|", str(Rect2(1.5, 2.25, -3.5, 4)))
	var g := Rect2i()
	var h := Rect2i(Vector2i(1, 2), Vector2i(3, 4))
	var i := Rect2i(1, 2, 3, 4)
	print("r06|", str(g), "|", str(h), "|", str(i), "|", typeof(i))
	print("r07|", str(Rect2(h)), "|", str(Rect2i(b)), "|", str(Rect2i(c)), "|", str(Rect2i(1.5, 2, 3, 4)))
	print("r08|", h.position, "|", h.size, "|", h.end, "|", h == i, "|", h != i)
	var j: Rect2
	var k: Rect2i
	print("r09|", str(j), "|", str(k), "|", typeof(j), typeof(k))
	print("r10|", var_to_str(c), "|", str_to_var(var_to_str(c)) == c, "|", var_to_str(i), "|", str_to_var(var_to_str(i)) == i)
	print("r11|", var_to_bytes(c), "|", bytes_to_var(var_to_bytes(c)) == c)
	print("r12|", var_to_bytes(i), "|", bytes_to_var(var_to_bytes(i)) == i)
	var arr: Array[Rect2] = [b, c]
	print("r13|", arr.size(), "|", arr[0] == b, "|", str(arr[1]))
	var v := {"k": c}
	print("r14|", v.size(), "|", v.has("k"), "|", str(v["k"]))
	var kd := {c: 1}
	print("r15|", kd.size(), "|", kd.has(Rect2(1, 2, 3, 4)), "|", kd[c])
	print("r16|", hash(b) == hash(c), "|", hash(b) == hash(b), "|", hash(h) == hash(i))
	print("r17|", c is Rect2, "|", i is Rect2i)
	quit()
