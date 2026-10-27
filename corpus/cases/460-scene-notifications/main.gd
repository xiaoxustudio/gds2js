extends Node2D

func _init():
	print("n|init|", get_name(), "|", get_child_count(), "|", get_class())

func _enter_tree():
	print("n|enter|", get_name(), "|", String(get_path()), "|", is_inside_tree(), "|", get_child_count())

func _ready():
	print("n|ready|", get_child_count(), "|", String(get_path()), "|", get_child(0).name, "|", str(get_children()))
	var late := Node.new()
	add_child(late)
	print("n|late|", get_child_count(), "|", late.get_name(), "|", late.is_inside_tree(), "|", get_tree().current_scene == self)

var _tick := 0

func _process(_d):
	_tick += 1
	print("n|root-process|", _tick, "|", _tick >= 2)
	if _tick >= 2:
		get_tree().quit(0)

func _exit_tree():
	print("n|exit|", get_name())
