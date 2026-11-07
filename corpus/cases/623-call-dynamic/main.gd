extends SceneTree

func f(x):
	print(x)

func _initialize():
	call("f", 7)
	quit()
