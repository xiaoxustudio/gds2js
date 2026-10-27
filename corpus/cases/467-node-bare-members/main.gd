extends Node2D

func _ready():
	print("m|p1|", name, "|", position, "|", rotation, "|", scale, "|", transform)
	print("m|p2|", visible, "|", z_index, "|", top_level, "|", y_sort_enabled, "|", rotation_degrees)
	position = Vector2(1.5, -2.25)
	rotation = 1.0
	scale = Vector2(2, 0.5)
	print("m|p3|", position, "|", rotation, "|", scale, "|", transform)
	transform = Transform2D(0, Vector2(7, 8))
	rotation_degrees = 90.0
	print("m|p4|", position, "|", rotation, "|", rotation_degrees, "|", transform)
	visible = false
	print("m|p5|", name, "|", visible, "|", z_index, "|", position, "|", global_position)
	global_position = Vector2(4, 4)
	print("m|p6|", position, "|", global_position)
	position += Vector2(1, 1)
	print("m|p7|", position, "|", get_name())
	name = "renamed"
	print("m|p8|", name, "|", get_name())
