extends Node

signal greet

class Target extends Node:
	func notify(x):
		print("target|", x)

var _t := 0
var _child: Target = null

func _ready():
	_child = Target.new()
	_child.name = "target"
	add_child(_child)
	greet.connect(_child.notify, CONNECT_DEFERRED)
	greet.connect(_child.notify, 0)
	print("a|", greet.is_connected(_child.notify))
	greet.emit(1)
	print("b")
	_child.free()
	print("c|", is_instance_valid(_child))
	greet.emit(2)
	print("d")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 3:
		get_tree().quit(0)
