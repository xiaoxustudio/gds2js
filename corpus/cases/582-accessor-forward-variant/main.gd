extends SceneTree

var A = thing
var thing: Variant = null:
	set(v):
		pass

func _initialize():
	print(A)
	print(thing)
	quit()
