extends SceneTree

class P2 extends RefCounted:
	func _init(p_a: int, p_b: int):
		print("P2._init ", p_a, " ", p_b)

class C2 extends P2:
	func _init():
		super()

func _initialize():
	var c = C2.new()
	print("t1")
	quit()
