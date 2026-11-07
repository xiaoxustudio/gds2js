extends SceneTree

func f(x):
	return x + 1

func _initialize():
	print(call("f", 7))
	quit()
