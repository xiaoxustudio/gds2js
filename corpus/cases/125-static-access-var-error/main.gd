extends SceneTree


class A:
	var mv: int = 7

	static func reads():
		return mv


func _initialize():
	print("t1 ", A.reads())
	quit()
