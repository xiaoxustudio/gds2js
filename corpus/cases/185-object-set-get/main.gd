extends SceneTree

class Thing extends RefCounted:
	var a = 7
	var s: String = "x"

	func hi():
		return 1

func _initialize():
	var o = Thing.new()
	o.set("a", 5)
	o.set("s", 12)
	print("r ", o.a, " ", o.get("a"), " ", o.s, " ", o.get("zz"), " ", typeof(o.get("zz")))
	print("r2 ", typeof(o.get("hi")), " ", o.call("hi"))
	quit()
