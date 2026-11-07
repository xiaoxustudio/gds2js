extends SceneTree

func g(x: int):
	print(x)

func _initialize():
	Callable(self, "g").call("a")
	quit()
