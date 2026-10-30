extends SceneTree

class A:
	var parts = []

	func note(x):
		parts.append("a-" + str(x))
		return parts.size()

	func _init():
		note(0)


class B extends A:
	func note(x):
		parts.append("b-" + str(x))
		var n = super.note(x)
		return n + 1

	func show():
		return str(parts)


func _initialize():
	var b = B.new()
	print("a|", b.note(1), "|", b.show())
	quit()
