extends SceneTree

class Holder:
	var m = 1
	static func make():
		return self.m

func _initialize():
	var h = Holder.new()
	print("t1 ", h.m)
	print("t2 ", Holder.make())
	quit()
