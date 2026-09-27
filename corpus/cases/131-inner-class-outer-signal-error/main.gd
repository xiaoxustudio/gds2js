extends SceneTree

signal g_sig(x)


class Inner:
	func touch_sig():
		return g_sig


func _initialize():
	print("t1 ", Inner.new().touch_sig())
	quit()
