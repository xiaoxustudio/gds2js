extends SceneTree

func _initialize():
	flat(1)
	flat(2)
	flat(3)
	nested(1)
	nested(2)
	nested(3)
	nested2(1)
	nested2(2)
	nested2(3)
	quit()


func flat(x):
	if x == 1:
		print("f-a")
	elif x == 2:
		print("f-b")
	else:
		print("f-c")


func nested(x):
	if x == 1:
		print("n-a")
	elif x == 2:
		if x > 0:
			print("n-b-inner")
	else:
		print("n-c")


func nested2(x):
	if x == 1:
		print("m-a")
	if x == 2:
		print("m-b")
	else:
		print("m-c")
