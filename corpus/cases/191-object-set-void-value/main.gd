extends SceneTree

class Thing extends RefCounted:
	var s: String = "x"

func _initialize():
	var o = Thing.new()
	var u = o.set("s", "y")
	print("r ", u)
	quit()
