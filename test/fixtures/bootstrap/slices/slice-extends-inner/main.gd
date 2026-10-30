extends SceneTree

class Base:
	var tag = "base"

	func label():
		return "B:" + tag

	func _init():
		tag = "base-init"


class Derived extends Base:
	func label():
		return "D:" + super.label()


func _initialize():
	var b = Base.new()
	var d = Derived.new()
	print("a|", b.label(), "|", d.label(), "|", d.tag, "|", d is Base)
	quit()
