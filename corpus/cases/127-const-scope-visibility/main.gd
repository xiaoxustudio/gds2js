extends SceneTree

const TOP: int = 42
const NAME: String = "outer-name"


class Inner:
	const TOP: int = 7

	func read_outer():
		return NAME

	func read_shadow():
		return TOP

	static func read_static_outer():
		return NAME

	static func read_static_shadow():
		return TOP

	func via_self_dot():
		return self.TOP


func _initialize():
	var i = Inner.new()
	print("t1 ", TOP)
	print("t2 ", i.read_outer())
	print("t3 ", i.read_shadow())
	print("t4 ", Inner.read_static_outer())
	print("t5 ", Inner.read_static_shadow())
	print("t6 ", i.via_self_dot())
	print("t7 ", Inner.TOP)
	print("t8 ", i.TOP)
	quit()
