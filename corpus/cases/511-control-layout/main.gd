extends Control

func _ready():
	print("min|", get_minimum_size(), "|", get_combined_minimum_size())
	custom_minimum_size = Vector2(10, 20)
	print("cmin|", custom_minimum_size, "|", get_combined_minimum_size())
	print("anchor|", get_anchor(0), "|", get_anchor(1), "|", get_anchor(2), "|", get_anchor(3))
	print("flags|", size_flags_horizontal, "|", size_flags_vertical)
	size_flags_horizontal = 3
	size_flags_vertical = 1
	print("flags2|", size_flags_horizontal, "|", size_flags_vertical)
	get_tree().quit(0)
