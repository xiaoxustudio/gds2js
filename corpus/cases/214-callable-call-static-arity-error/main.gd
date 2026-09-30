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
	var c = Base.stwo
	print("r ", c.call(1))
	quit()
