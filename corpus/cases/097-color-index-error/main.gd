extends SceneTree

func _initialize():
	var c = Color(0.1, 0.2, 0.3, 0.4)
	print(c[4])
	print("不会走到这里")
