extends SceneTree


class A:
	func imeth():
		return "i"

	static func calls():
		return imeth()


func _initialize():
	print("t1 ", A.calls())
	quit()
