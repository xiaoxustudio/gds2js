extends SceneTree

func f(x: Error):
	print(x)

func _initialize():
	f(1)
	quit()
