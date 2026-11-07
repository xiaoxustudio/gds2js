extends SceneTree

class C:
	static var A = B
	static var B = 1

func _initialize():
	print(C.A)
	print(C.B)
	quit()
