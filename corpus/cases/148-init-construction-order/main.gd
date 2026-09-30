extends SceneTree

class Base extends RefCounted:
	var bx: int = _mk("Base.bx")

	func _init():
		print("n1 Base._init")

	func _mk(who: String) -> int:
		print("n2 init ", who)
		return 1

	func tag():
		return "base"

class NoInit extends Base:
	var cx: int = _mk("NoInit.cx")

class Own extends Base:
	var cx2: int = _mk("Own.cx2")

	func _init():
		print("n3 Own.before")
		super()
		print("n4 Own.after")

class Grand extends Own:
	var gx: int = _mk("Grand.gx")

	func _init():
		print("n5 Grand.before")
		super()
		super()

class Needs extends RefCounted:
	var n: int

	func _init(p_n: int):
		n = p_n
		print("n6 Needs._init ", p_n)

class SkipParent extends Needs:
	func _init():
		print("n7 SkipParent（没写 super，父体不该跑）")

class Forwarded extends Needs:
	var k: int = 3

class SuperOther extends Base:
	func tag():
		return "child+" + super.tag()

func _initialize():
	print("t1")
	var a = Base.new()
	print("t2 ", a.bx)
	print("t3")
	var b = NoInit.new()
	print("t4 ", b.bx, " ", b.cx, " ", b is Base)
	print("t5")
	var c = Own.new()
	print("t6 ", c.cx2)
	print("t7")
	var g = Grand.new()
	print("t8 ", g.gx)
	print("t9")
	var s = SkipParent.new()
	print("t10 ", s.n)
	print("t11")
	var f = Forwarded.new(9)
	print("t12 ", f.n, " ", f.k)
	var o = SuperOther.new()
	print("t13 ", o.tag())
	quit()
