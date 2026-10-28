extends Node

func _ready():
	add_to_group("alpha")
	print("g|g1|", get_groups())
