extends SceneTree

func _g():
	return 3

var A = thing
var thing: int = 9:
	get = _g

func _initialize():
	print(A)
	print(thing)
	quit()
