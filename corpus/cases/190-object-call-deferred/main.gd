extends SceneTree

class Thing extends RefCounted:
	var s: String = "x"

	func hi(a, b):
		return a + b

	func name2():
		return "nm"

func _initialize():
	var o = Thing.new()
	print("r ", o.call_deferred("hi", 1, 2))
	print("r2 ", o.call_deferred("name2"))
	o.set("hi", 5)
	print("r3 ", typeof(o.get("hi")), " ", o.s)
	print("r4 ", o.call("hi", 3, 4), " ", typeof(o.get("s")))
	quit()
