extends SceneTree

class NoInit extends RefCounted:
	func who():
		return "NoInit"

class CSuperNoInit extends NoInit:
	func _init():
		super()

	func who():
		return "C:" + super.who()

func _initialize():
	var c = CSuperNoInit.new()
	print("t1 ", c.who())
	quit()
