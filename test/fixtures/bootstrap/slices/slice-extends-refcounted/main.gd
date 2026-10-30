extends SceneTree

class Shape extends RefCounted:
	var tag = "shape"

	func label():
		return "L:" + tag


func _initialize():
	var s = Shape.new()
	print("a|", s.label(), "|", s.tag, "|", s is RefCounted, "|", s.get_class())
	quit()
