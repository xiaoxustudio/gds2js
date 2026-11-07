extends SceneTree

func f(x):
	print(x)

func _initialize():
	callv("f", [7])
	quit()
