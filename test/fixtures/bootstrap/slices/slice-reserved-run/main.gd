extends SceneTree

func report(x):
	print("r|", x)


func _initialize():
	report(1)
	run(2)
	quit()


func run(x):
	print("r|", x, "|mine")
