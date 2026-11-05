extends Node

signal s

class Sink extends RefCounted:
	func on(x):
		print("sink|", x)

var _t := 0

func _ready():
	_mk()
	print("after-mk")

func _mk():
	var sk = Sink.new()
	s.connect(sk.on, 1)
	print("connected|", s.is_connected(sk.on))
	s.emit(1)
	s.connect(func(x): print("lam|", x), 1)
	s.emit(2)
	print("emitted")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 3:
		get_tree().quit(0)
