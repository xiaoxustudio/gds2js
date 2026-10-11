extends SceneTree

func _initialize():
	var v: Vector2 = Vector2(3, 4)
	if false:
		print("DEAD|", v.limit_length(2.0, 3.0))
	print("LIVE|", v.length())
	quit()
