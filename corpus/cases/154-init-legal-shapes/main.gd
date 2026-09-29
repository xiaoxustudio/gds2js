extends SceneTree

class Bare extends RefCounted:
	func _init():
		print("n1 Bare._init")
		return

class Empty extends Bare:
	pass

class NeedsArg extends RefCounted:
	var n: int

	func _init(p_n: int):
		n = p_n
		print("n2 NeedsArg._init ", p_n)

class Forward extends NeedsArg:
	var k: int = 3

class Right extends NeedsArg:
	func _init(p_x: int):
		super(p_x)
		print("n3 Right.after-super ", p_x)

func _initialize():
	var a = Bare.new()
	print("n4 empty=", typeof(Empty.new()), " bare=", a is Bare)
	var f = Forward.new(9)
	print("n5 ", f.n, " ", f.k)
	var r = Right.new(4)
	print("n6 ", r.n)
	quit()
