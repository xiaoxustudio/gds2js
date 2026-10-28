extends Node

func _ready():
	add_to_group("alpha")
	add_to_group("beta")
	print("g|k1|", get_groups(), "|", is_in_group("beta"), "|", is_in_group("zeta"))
