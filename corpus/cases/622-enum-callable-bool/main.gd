extends SceneTree

func f(x: Error):
	print(x)

func _initialize():
	Callable(self, "f").call(true)
	quit()
