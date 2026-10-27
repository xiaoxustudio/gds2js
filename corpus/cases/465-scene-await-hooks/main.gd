extends Node2D

var _t := 0
var _v := 0
var _k := 0

func inner() -> int:
	return 7

func helper() -> int:
	return await inner()

func _ready():
	print("w|ready-before|", _v)
	_v = await helper()
	print("w|ready-after|", _v)

func _process(_d):
	_t += 1
	if _t == 1:
		_k = await helper()
	print("w|process|", _t, "|", _v, "|", _k)
	if _t >= 2:
		get_tree().quit(0)

func _exit_tree():
	print("w|exit|", _t, "|", _v, "|", _k)
