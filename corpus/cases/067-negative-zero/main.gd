extends SceneTree

func _initialize():
	var neg = -0.0
	print(neg)
	print(1.0 / neg)
	print(-1.0 / neg)
	var pos = 5.0
	pos = pos - pos
	print(pos)
	print(1.0 / pos)
	print(-1.0 / pos)
	print(neg == pos)
	print(neg < pos)
	quit()
