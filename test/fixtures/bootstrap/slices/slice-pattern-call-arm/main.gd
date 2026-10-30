extends SceneTree

var calls = 3


func describe(x):
	match x:
		str(calls):
			return "str-calls"
		[0, calls]:
			return "list-var"
		_:
			return "rest-" + str(x)


func _initialize():
	print("a|", describe("3"), "|", describe([0, 3]))
	quit()
