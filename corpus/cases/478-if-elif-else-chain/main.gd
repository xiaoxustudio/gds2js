extends SceneTree

func _initialize():
	flat(0)
	flat(1)
	flat(2)
	flat(3)
	flat(4)
	dangling(0)
	dangling(1)
	dangling(2)
	dangling(3)
	deep(0)
	deep(1)
	deep(2)
	deep(3)
	tail_if(0)
	tail_if(1)
	tail_if(2)
	tail_if(3)
	in_loop(0)
	in_loop(1)
	in_loop(2)
	in_loop(3)
	quit()


func flat(x):
	if x == 1:
		print("f|", "a")
	elif x == 2:
		print("f|", "b")
	elif x == 3:
		print("f|", "c")
	else:
		print("f|", "z")


func dangling(x):
	if x == 1:
		if x > 0:
			print("d|", "inner-then")
		else:
			print("d|", "inner-else")
	else:
		print("d|", "outer-else")


func deep(x):
	if x == 1:
		print("p|", "a")
	elif x == 2:
		if x > 0:
			print("p|", "b-inner")
		else:
			print("p|", "b-inner-else")
	else:
		print("p|", "z")



func tail_if(x):
	if x == 1:
		print("t|", "a")
	elif x == 2:
		if x > 1:
			print("t|", "b-inner")
	else:
		print("t|", "z")


func in_loop(x):
	for n in [1, 2]:
		if x == 1:
			print("l|", n, "|", "a")
		elif x == 2:
			if n > 1:
				print("l|", n, "|", "b-inner")
		else:
			print("l|", n, "|", "z")
