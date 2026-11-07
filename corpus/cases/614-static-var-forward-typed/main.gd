extends SceneTree

static var A = B
static var B: int = 5

func _initialize():
	print(A)
	print(B)
	quit()
