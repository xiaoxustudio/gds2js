extends Node

var tick := 0

func _ready():
	var t := get_node("T")
	t.wait_time = 0.05
	t.one_shot = true
	t.timeout.connect(func(): print("to|", tick, "|", t.time_left, "|", t.is_stopped()))
	t.start()

func _process(_d):
	tick += 1
	if tick == 8:
		print("end|", get_node("T").is_stopped())
		get_tree().quit(0)
