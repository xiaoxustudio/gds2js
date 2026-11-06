extends Node

func _init():
	tree_entered.connect(func(): print("R|te"))
	ready.connect(func(): print("R|rd"))
	tree_exiting.connect(func(): print("R|tx"))
	tree_exited.connect(func(): print("R|td"))

func _ready():
	get_node("P").tree_entered.connect(func(): print("X|te"))
	get_node("P").ready.connect(func(): print("X|rd"))
	get_node("P").tree_exiting.connect(func(): print("X|tx"))
	get_node("P").tree_exited.connect(func(): print("X|td"))
	set_process(true)

func _process(_d):
	print("R|p")
	set_process(false)
	get_tree().quit(0)
