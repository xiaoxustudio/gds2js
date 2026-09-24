extends SceneTree

func _initialize():
	var acc = 0.0
	var i = 0.0
	while i < 5.0:
		acc = acc + i * 2.0
		i = i + 1.0
	print(acc)
	var n = 3
	var f: float = n
	print(f)
	print(n + 1)
	print(2 + 3 * 4)
	print(n < 4)
	quit()
