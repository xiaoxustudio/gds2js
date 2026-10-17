extends SceneTree

func _initialize():
	var f2 = func(a, b): return a * 100 + b
	var g = f2.bind(1, 2)
	print("X1|", g.call(), " ", g.get_argument_count(), " ", g.get_bound_arguments())
	var u1 = g.unbind(1)
	print("X2|", u1.call(9), " ", u1.get_argument_count(), " ", u1.get_bound_arguments(), " ", u1.get_bound_arguments_count())
	var u2 = g.unbind(2)
	print("X3|", u2.call(7, 8), " ", u2.get_argument_count(), " ", u2.get_bound_arguments())
	var u0 = g.unbind(0)
	print("X4|", u0.call(), " ", u0.get_argument_count())
	var f3 = func(a, b, c): return a * 10000 + b * 100 + c
	var h = f3.bind(1, 2, 3)
	print("X5|", h.unbind(2).call(8, 9), " ", h.unbind(2).get_argument_count(), " ", h.unbind(1).call(8))
	print("X6|", f3.bind(1, 2).unbind(1).call(8, 9), " ", f3.bind(1, 2).unbind(1).get_argument_count())
	print("X7|", h.unbind(9).call(1, 2, 3, 4, 5, 6, 7, 8, 9))
	quit()
