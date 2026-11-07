extends SceneTree

func g(x: int):
	print(x)

func _initialize():
	call("g", "a")
	quit()
