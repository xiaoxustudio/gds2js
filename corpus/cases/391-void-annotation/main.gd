extends SceneTree

var w1: void = 1

func f1(a: void):
	pass

func f2(a: Array[void] = [1]):
	pass

func f3(a: Dictionary[void, int] = {}):
	pass

class Inner:
	var w2: void = 2
	func g(a: void):
		pass

func f4() -> void:
	pass

func _initialize():
	f4()
	print("ok")
	quit()
