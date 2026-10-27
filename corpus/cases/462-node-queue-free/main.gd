extends Node

var _d: Node = null
var _t := 0

func _ready():
	_d = Node.new()
	_d.name = "doomed"
	add_child(_d)
	print("q|before|", get_child_count(), "|", is_instance_valid(_d), "|", _d.is_queued_for_deletion())
	_d.queue_free()
	print("q|after|", get_child_count(), "|", is_instance_valid(_d), "|", _d.is_queued_for_deletion())

func _process(_dt):
	_t += 1
	print("q|tick|", _t, "|", get_child_count(), "|", is_instance_valid(_d))
	if _t >= 2:
		get_tree().quit(0)

func _exit_tree():
	print("q|exit|", get_child_count())
