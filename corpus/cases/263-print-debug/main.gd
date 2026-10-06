extends SceneTree

class C:
	func m():
		print_debug("in m", 2)

	static func sf():
		print_debug("in static")

	func _init():
		print_debug("in _init")

func leaf():
	print_debug("leaf")

func mid():
	leaf()

func _initialize():
	print_debug("one", [1, {"a": 2}], 3.0)
	print_debug()
	print("stdout between")
	mid()
	var c = C.new()
	c.m()
	C.sf()
	var f = func():
		print_debug("in lambda")
	f.call()
	print_debug("last", null, true)
	quit()
