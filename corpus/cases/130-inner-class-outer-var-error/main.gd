extends SceneTree

var g_var: int = 7


class Inner:
	func read_gvar():
		return g_var


func _initialize():
	print("t1 ", Inner.new().read_gvar())
	quit()
