extends SceneTree

class C:
	var A = B
	var B = A

func _initialize():
	print(C.new().A)
	quit()
