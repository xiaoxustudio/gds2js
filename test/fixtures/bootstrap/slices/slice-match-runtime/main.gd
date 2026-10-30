extends SceneTree

const SHAPE = 2
var calls = 3


func kind(x):
	match x:
		1:
			return "one"
		SHAPE:
			return "shape"
		var bound:
			return "bound-" + str(bound)
		[1, 2]:
			return "list"
		_:
			return "rest"


func _initialize():
	print("a|", kind(1), "|", kind(2), "|", kind(9), "|", kind([1, 2]))
	quit()
