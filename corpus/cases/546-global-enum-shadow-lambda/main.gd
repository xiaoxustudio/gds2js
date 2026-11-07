extends SceneTree

func _initialize():
	var f = func(Error): print(Error.OK)
	f.call(1)
	quit()
