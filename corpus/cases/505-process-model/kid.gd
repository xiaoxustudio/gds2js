extends Node

var n := 0
var p := 0

func _process(_d):
	n += 1
	if n <= 6:
		print(name, "|p|", n, "|", can_process())
	if name == "P" and n == 6:
		get_tree().quit(0)

func _physics_process(_d):
	p += 1
	if p <= 3:
		print(name, "|f|", p)
