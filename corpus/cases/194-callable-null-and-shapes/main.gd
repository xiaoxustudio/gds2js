extends SceneTree

class Thing:
	func hi(a):
		return a

func _initialize():
	var cb = Callable()
	print("r1 ", typeof(cb), " ", cb.is_null(), " ", cb.is_valid())
	print("r2 ", cb.get_method() == "", " ", cb.get_argument_count(), " ", cb.get_bound_arguments().size())
	print("r3 ", typeof(cb.callv([1, 2])), " ", cb.callv([1, 2]) == null)
	var b = cb.bind(1)
	print("r4 ", typeof(b), " ", b.is_null())
	var f = func(x):
		return x
	print("r5 ", f.is_null(), " ", f.is_valid(), " ", f.get_method())
	var o = Thing.new()
	var im = o.hi
	print("r6 ", im.is_null(), " ", im.is_valid(), " ", im.get_method(), " ", im.call(7))
	print("r7 ", typeof(Callable(o, "hi")), " ", Callable(o, "hi").get_method(), " ", Callable(o, "hi").call(8))
	quit()
