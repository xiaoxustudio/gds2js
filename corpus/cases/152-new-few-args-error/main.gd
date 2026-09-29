extends SceneTree

class Needs extends RefCounted:
	var n: int

	func _init(p_n: int):
		n = p_n
		print("Needs._init ", p_n)

class NoInit extends Needs:
	pass

func _initialize():
	var a = NoInit.new()
	print("t1 ", a.n)
	quit()
