extends SceneTree

class Thing extends RefCounted:
	func hi(x, y):
		return x + y

	func twice(s = "z"):
		return s + s

func _initialize():
	var o = Thing.new()
	print("r ", o.call("hi", 2, 3), " ", o.callv("hi", [4, 5]))
	print("r2 ", o.call("twice"), " ", o.call("twice", "q"), " ", o.has_method("hi"))
	quit()
