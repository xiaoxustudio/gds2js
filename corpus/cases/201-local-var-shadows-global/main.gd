extends SceneTree

func f():
	return PI

func _initialize():
	var PI = 5
	print("r1 ", PI, " ", typeof(PI))
	print("r2 ", f(), " ", typeof(f()))
	quit()
