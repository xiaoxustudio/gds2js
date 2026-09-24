extends SceneTree

func _initialize():
	var a = [1, 2, 3]
	print(a[-1])
	print(a[-3])
	a[-1] = 9
	print(a)
	a[-2] = 8
	print(a)
	a[0] = 5
	print(a)
	var b = [[1, 2], [3, 4]]
	print(b[-1][-1])
	b[-1][0] = 7
	print(b)
	b[0][1] = 6
	print(b)
	print(a.size())
	print(b.size())
	quit()
