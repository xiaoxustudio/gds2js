extends SceneTree

class Base extends RefCounted:
	func three(a, b, c):
		return str(a, b, c)

	func twice(x, y = "z"):
		return str(x, y)

	static func stwo(a, b):
		return str(a, b)

class Derived extends Base:
	func own(a):
		return a

func _initialize():
	var o = Base.new()
	print("r1 ", o.three.call(1, 2, 3))
	print("r2 ", o.three.bind(1, 2).call(3))
	print("r3 ", o.three.callv([1, 2]))
	print("r4 ", o.three.callv([1, 2, 3, 4]))
	print("r5 ", o.three.callv([1, 2, 3]))
	print("r6 ", o.twice.call(1, 2), " ", o.twice.call(5))
	var d = Derived.new()
	print("r7 ", d.own.call(7), " ", d.three.call(1, 2, 3))
	var f = func(x, y):
		return x + y
	print("r8 ", f.call(1, 2), " ", f.bind(1).call(2))
	quit()
