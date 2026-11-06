extends Node

var proc := 0
var phys := 0

func _init():
	print("init|", is_processing(), "|", is_physics_processing(), "|", process_mode)

func _ready():
	print("ready|", is_processing(), "|", is_physics_processing(), "|", process_mode, "|", can_process())

func _process(_d):
	proc += 1
	print("root|p|", proc)
	if proc == 1:
		set_process(false)

func _physics_process(_d):
	phys += 1
	if phys == 1:
		print("root|f|", phys)
