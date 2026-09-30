extends SceneTree

class NoInit extends RefCounted:
	var a = 7
	var shadow = 100
	func get_a():
		return a

	const CA = 99

class Plain extends NoInit:
	func _init():
		print("plain ", a, " ", get_a(), " ", CA)

	func show():
		var a = 1
		print("shadow ", a, " ", self.a, " ", shadow)

class Mid extends Plain:
	var b = 3

	func bare():
		print("mid ", a, " ", get_a(), " ", CA, " ", b)

	func bump():
		a = a + 1
		print("bump ", a, " ", get_a())

func _initialize():
	var p = Plain.new()
	print("p ", p != null)
	var m = Mid.new()
	m.bare()
	m.show()
	m.bump()
	print("after ", m.a, " ", m.shadow, " ", typeof(m))
	quit()
