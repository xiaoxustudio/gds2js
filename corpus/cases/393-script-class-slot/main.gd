extends SceneTree

class Inner:
	var k: int = 1

	var m2: Inner = 1

	func g():
		var w3: Inner = 2

var x1: Inner = 1
var x2: Inner = null
var x3: Inner = [1]
var x4: Inner = Vector2(1, 2)

func f1(a: Inner = 1):
	pass

func f2(a: Inner = "s"):
	pass

func f3(a: Inner = null):
	pass

func f4(a: Inner = Inner.new()):
	pass

func f5():
	var w1: Inner = 1
	if w1 == null:
		var w2: Inner = "s"
	print(w1)

func _initialize():
	f5()
	print("ok")
	quit()
