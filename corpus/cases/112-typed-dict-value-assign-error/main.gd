extends SceneTree

func _initialize():
	var d: Dictionary[int, String] = {1: "a"}
	d[1] = 5
	print(d)
	quit()
