extends SceneTree

class Holder:
	static var count = 3

	static func _init():
		print("s|static-init")

	static func label():
		return "holder-" + str(count)


func _initialize():
	print("a|", Holder.label(), "|", Holder.count)
	quit()
