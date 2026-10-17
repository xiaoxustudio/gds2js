extends SceneTree

class Inner:
	var k: int = 1

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

func _initialize():
	print(x2, f3(1), f4(1))
	quit()
