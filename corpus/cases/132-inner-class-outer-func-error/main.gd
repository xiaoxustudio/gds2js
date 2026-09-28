extends SceneTree

func helper():
	return "outer-helped"


class Inner:
	func callhelper():
		return helper()


func _initialize():
	print("t1 ", Inner.new().callhelper())
	quit()
