extends Node2D

func _ready():
	add_to_group("zeta")
	add_to_group("alpha")
	add_to_group("aardvark")
	add_to_group("alpha", true)
	print("g|p1|", get_groups(), "|", is_in_group("alpha"), "|", is_in_group("nope"))
	add_to_group("")
	print("g|p2|", str(get_tree().get_nodes_in_group("alpha")))
	print("g|p3|", get_tree().get_nodes_in_group("beta").size(), "|", str(get_tree().get_nodes_in_group("none")))
	var k := get_node("Kid")
	print("g|p4|", k.is_in_group("alpha"), "|", str(k.get_groups()))
	k.remove_from_group("alpha")
	k.remove_from_group("nope")
	print("g|p5|", str(get_tree().get_nodes_in_group("alpha")), "|", k.is_in_group("alpha"), "|", str(k.get_groups()))
	get_tree().quit()
