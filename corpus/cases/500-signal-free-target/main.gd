extends Node

const Target = preload("res://target.gd")

signal s

var _t := 0

func _ready():
	var n = Target.new()
	n.name = "n"
	add_child(n)
	var cb = n.on
	print("cb|", cb, "|", cb.is_valid(), "|", cb.get_method(), "|", cb.call(7))
	print("obj|", cb.get_object() == n)
	s.connect(cb)
	print("pre|", s.is_connected(cb), "|", s.has_connections(), "|", s.get_connections().size())
	s.emit(1)
	n.free()
	print("post|", is_instance_valid(n), "|", s.is_connected(cb), "|", s.has_connections(), "|", s.get_connections().size(), "|", cb.is_valid())
	s.emit(2)
	print("end")

func _process(_dt):
	_t += 1
	print("tick|", _t)
	if _t >= 2:
		get_tree().quit(0)
