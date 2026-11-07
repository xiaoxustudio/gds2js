extends SceneTree

func f():
	return 1

const A = f()

func _initialize():
	print(A)
	quit()
