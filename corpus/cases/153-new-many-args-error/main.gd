extends SceneTree

class D extends RefCounted:
	var a: int

	func _init(p_a: int = 7):
		a = p_a
		print("D._init ", p_a)

func _initialize():
	var y = D.new(1, 2)
	print("t ", y.a)
	quit()
