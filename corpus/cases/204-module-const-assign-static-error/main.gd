extends SceneTree

const C: int = 1

func _initialize():
	C += 1
	print("r ", C)
	quit()
