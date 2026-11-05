extends Node

signal s5
signal s9
signal s1
signal sd

var _t := 0

func _ready():
	s5.connect(func(x): print("o5|", x), 5)
	s5.emit(1)
	s5.emit(2)
	s5.emit(3)
	var cb9 = func(x): print("o9|", x)
	print("c9|", s9.connect(cb9, 9), "|", s9.connect(cb9, 9))
	s9.emit(4)
	s9.emit(5)
	var cb1 = func(x): print("o1|", x)
	print("c1|", s1.connect(cb1, 1), "|", s1.connect(cb1, 1))
	s1.emit(6)
	var cbd = func(x): print("od|", x)
	sd.connect(cbd, 1)
	sd.emit(7)
	sd.disconnect(cbd)
	print("ready-end")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 2:
		get_tree().quit(0)
