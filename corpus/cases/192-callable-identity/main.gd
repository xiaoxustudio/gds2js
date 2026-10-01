extends SceneTree

class Thing:
	func add3(a, b, c):
		return a + b + c

	static func sm(x):
		return x

func _initialize():
	var o = Thing.new()
	var p = Thing.new()
	print("r1 ", o.add3 == o.add3, " ", o.add3 == p.add3)
	print("r2 ", o.add3.bind(1) == o.add3.bind(2))
	print("r3 ", Thing.sm == Thing.sm)
	var f = func(x):
		return x
	var g = func(x):
		return x
	print("r4 ", f == f, " ", f == g)
	var a = [o.add3, o.add3]
	print("r5 ", a.has(o.add3), " ", a.size())
	print("r6 ", Callable() == Callable(), " ", Callable() != Callable())
	quit()
