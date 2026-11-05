extends Node

signal sa
signal sb
signal sc

class T extends Node:
	func on(x):
		print("t|", x)

var _t := 0

func _ready():
	var t1 = T.new()
	add_child(t1)
	sa.connect(t1.on, 1)
	sa.emit(1)
	t1.free()
	var t2 = T.new()
	add_child(t2)
	sb.connect(t2.on, 1)
	sb.emit(2)
	t2.free()
	sb.emit(22)
	var t3 = T.new()
	add_child(t3)
	sc.connect(t3.on, 1)
	sc.connect(t3.on, 0)
	sc.emit(3)
	t3.free()
	print("ready-end")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 2:
		get_tree().quit(0)
