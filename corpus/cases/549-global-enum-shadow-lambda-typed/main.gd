extends SceneTree

func _initialize():
	var f = func(Error: int): print(Error.OK)
	f.call(1)
	quit()
