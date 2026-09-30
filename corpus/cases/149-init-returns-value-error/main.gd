extends SceneTree

class R2 extends RefCounted:
	func _init(p: int):
		if p > 0:
			return p
		print("R2._init")

func _initialize():
	var r = R2.new(1)
	print("t1 ok")
	quit()
