extends Node

func _ready():
	print("k|p1|", name, "|", get_parent().name, "|", get_child_count())
	name = "kid2"
	print("k|p2|", name, "|", get_parent().name)
