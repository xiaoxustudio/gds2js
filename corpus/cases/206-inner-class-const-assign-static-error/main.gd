extends SceneTree

class Thing:
	const K = 5

	func f():
		K = 6
		return K

func _initialize():
	var o = Thing.new()
	print("r ", o.f())
	quit()
