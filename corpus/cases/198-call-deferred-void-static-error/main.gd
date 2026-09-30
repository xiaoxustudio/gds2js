extends SceneTree

class Thing:
	func hi(a):
		return a

func _initialize():
	var o = Thing.new()
	var c: Callable = o.hi
	var v = c.call_deferred(1)
	print("r ", v)
	quit()
