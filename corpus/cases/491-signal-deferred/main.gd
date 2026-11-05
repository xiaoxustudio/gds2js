extends Node

signal greet
signal once
signal refsig
signal dropsig

var _t := 0

func on_greet(x):
	print("self|", x)

func _ready():
	greet.connect(func(x): print("lam|", x), 1)
	greet.emit(1)
	greet.emit(2)
	greet.connect(on_greet, 1)
	greet.emit(3)
	once.connect(func(x): print("once|", x), 5)
	once.emit(4)
	once.emit(5)
	var cb_ref = func(x): print("ref|", x)
	print("refc|", refsig.connect(cb_ref, 9), "|", refsig.connect(cb_ref, 9))
	refsig.emit(6)
	refsig.emit(7)
	var cb_drop = func(x): print("drop|", x)
	dropsig.connect(cb_drop, 1)
	dropsig.emit(8)
	dropsig.disconnect(cb_drop)
	var empty: Callable
	empty.call_deferred()
	print("ready-end")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 2:
		get_tree().quit(0)
