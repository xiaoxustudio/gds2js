extends SceneTree

func _initialize():
	print(range(0.5, 2.5))
	print(range(2.5))
	print(range(0, 3.9))
	print(range(0, 3, 2.5))
	print(range(0, 3, true))
	print(range(-2))
	print(range(0, 0))
	print(range(3))
	print(range(1, 4))
	print(range(4, 0, -2))
	print(range(0, 5, 2))
	print(range(0.9, 0.1))
	print(range(-1.5, 1.5))
	print(range(0, 3, 1.001))
	var st = 1.7
	print(range(0, 6, st))
	for i in range(2.5):
		print(i)
	for i in range(0, 3, 1.5):
		print(i)
	var total = 0
	for i in range(0.5, 4.5):
		total += i
	print(total)
	quit()
