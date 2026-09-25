extends SceneTree

func _initialize():
	for i in range(0, 10, 2):
		print(i)
	for j in range(10, 0, -2):
		print(j)
	print(range(0, 20, 5).size())
	for x in range(0.0, 3.0):
		print(x)
	print(range(2, 8, 3)[1])
	quit()
