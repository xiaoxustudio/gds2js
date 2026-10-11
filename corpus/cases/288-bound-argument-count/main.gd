extends SceneTree

class A:
	func one(a):
		return a

	func two(a, b):
		return a * 10 + b

	func three(a, b, c):
		return a * 100 + b * 10 + c

func _initialize():
	var o = A.new()
	var h = func(a): return a * 100
	var f = func(a, b): return a * 100 + b
	var c = Callable()
	print("n01 ", c.get_argument_count(), " ", c.get_bound_arguments(), " ", c.is_null())
	print("n02 ", c.bind(1).get_argument_count(), " ", c.bind(1).get_bound_arguments(), " ", c.bind(1).is_null(), " ", typeof(c.bind(1)))
	print("n03 ", c.bind(1, 2).get_argument_count(), " ", c.bind(1, 2).get_bound_arguments(), " ", c.bind(1, 2).is_null())
	print("n04 ", c.bind(1).bind(2).get_argument_count(), " ", c.bind(1).bind(2).get_bound_arguments())
	print("n05 ", f.get_argument_count(), " ", f.get_bound_arguments(), " ", f.is_null())
	print("n06 ", f.bind(7).get_argument_count(), " ", f.bind(7).get_bound_arguments(), " ", f.bind(7).call(9), " ", f.bind(7).get_bound_arguments_count())
	print("o01 ", o.two.get_argument_count(), " ", o.two.bind(1).get_argument_count(), " ", o.two.bind(1, 2).get_argument_count())
	print("o02 ", o.three.get_argument_count(), " ", o.three.bind(1).get_argument_count(), " ", o.three.bind(1, 2).get_argument_count())
	print("over-method ", o.one.bind(1, 2, 3).get_argument_count(), " ", o.one.bind(1, 2, 3).get_bound_arguments())
	print("over-lambda ", h.bind(1, 2).get_argument_count(), " ", h.bind(1, 2).get_bound_arguments(), " ", h.bind(1, 2).get_bound_arguments_count())
	print("over-chained ", h.bind(1).bind(2).get_argument_count(), " ", h.bind(1).bind(2).get_bound_arguments())
	quit()
