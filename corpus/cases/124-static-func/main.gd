extends SceneTree

const TOP: int = 42

static func helper():
	return TOP + 1

static func usehelper():
	return helper()


class Inner:
	const CV: int = 99
	var mv: int = 7

	static func make():
		return "made"

	static func twice(x):
		return x * 2

	static func selfcall():
		return twice(21)

	static func readconst():
		return CV

	static func rec(n):
		if n <= 0:
			return 0
		return n + rec(n - 1)

	func usestatic():
		return make()


func outerbare():
	return helper()


func _initialize():
	var p = Inner.new()
	print("u1 ", Inner.make())
	print("u2 ", Inner.twice(21))
	print("u3 ", Inner.selfcall())
	print("u4 ", Inner.readconst())
	print("u5 ", Inner.rec(10))
	print("u6 ", p.usestatic())
	print("u7 ", p.make())
	print("u8 ", p.twice(3))
	print("u9 ", typeof(Inner.make))
	print("u10 ", Inner.make.call())
	print("u11 ", helper())
	print("u12 ", usehelper())
	print("u13 ", outerbare())
	print("u14 ", self.helper())
	var cb = Inner.make
	print("u15 ", typeof(cb), " ", cb.call())
	print("u16 ", typeof(usehelper))
	quit()
