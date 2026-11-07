extends SceneTree

var A = thing
var thing: int = 9:
	get:
		return 3

func _initialize():
	print(A)
	print(thing)
	quit()
