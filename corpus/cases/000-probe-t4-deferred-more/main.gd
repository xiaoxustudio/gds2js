extends Node

signal s

var _t := 0

func _ready():
	var cb = func(x): print("d|", x, "|", _t)
	print("c1|", s.connect(cb, 1))
	s.emit(1)
	s.emit(2)
	print("c2|", s.connect(func(): print("once"), 5))
	s.emit(3)
	print("c3|", s.connect(func(): print("ref"), 9))
	print("c4|", s.connect(func(): print("nom"), 0))
	s.emit(4)
	var empty: Callable
	print("empty|", empty.is_null())
	empty.call_deferred()
	print("after-empty")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 3:
		get_tree().quit(0)
