extends SceneTree

func _initialize():
	var e = Array()
	print("u1 ", e, " ", e.is_typed(), " ", e.size())
	e.append(1)
	print("u2 ", e, " ", typeof(e[0]))
	var a = [1, 2]
	var r = Array(a)
	print("u3 ", r, " ", r.is_typed(), " ", typeof(r[0]), " ", r.size())
	r[0] = 7
	print("u4 ", a, " ", r)
	var b = [[1], [2]]
	var c = Array(b)
	c[0][0] = 9
	print("u5 ", b, " ", c)
	var p = PackedByteArray([3, 1])
	var q = Array(p)
	q.append(9)
	print("u6 ", p, " ", q)
	quit()
