extends SceneTree

class Thing:
	func add3(a, b, c):
		return a + b + c

	static func sadd3(a, b, c):
		return a + b + c

func _initialize():
	var o = Thing.new()
	var c0 = o.add3
	var c1 = c0.bind(1)
	var c2 = c0.bind(1, 2)
	var c3 = c0.bind(1, 2, 3)
	var ce = c0.bind()
	print("r1 ", c0.get_argument_count(), " ", c1.get_argument_count(), " ", c2.get_argument_count(), " ", c3.get_argument_count(), " ", ce.get_argument_count())
	print("r2 ", c1.get_bound_arguments().size(), " ", c3.get_bound_arguments().size(), " ", ce.get_bound_arguments().size())
	var st = Thing.sadd3
	print("r3 ", st.get_argument_count(), " ", st.bind(1).get_argument_count())
	var f = func(x, y, z):
		return x
	print("r4 ", f.get_argument_count(), " ", f.bind(9).get_argument_count())
	print("r5 ", c0.call(1, 2, 3), " ", c0.get_argument_count())
	print("r6 ", c2.call(3))
	quit()
