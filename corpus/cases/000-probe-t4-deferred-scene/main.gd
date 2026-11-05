extends Node

signal greet

var _t := 0
var _child: Node = null

func _ready():
	print("r|0")
	greet.connect(func(x): print("d|", x, "|", _t), CONNECT_DEFERRED)
	print("r|1")
	greet.emit(7)
	print("r|2")
	print("r|3")
	_child = Node.new()
	_child.name = "doomed"
	add_child(_child)
	_child.queue_free()
	print("r|4|", is_instance_valid(_child))
	_child.call_deferred("free")
	print("r|5")

func _process(_dt):
	_t += 1
	print("tick|", _t, "|", is_instance_valid(_child))
	if _t >= 2:
		get_tree().quit(0)

func _exit_tree():
	print("exit|", _t)
