extends Node2D

func _process(_d):
	print("c|p1|", name, "|", position, "|", global_position, "|", rotation)
	rotation = 0.25
	position += Vector2(1, 1)
	print("c|p2|", rotation, "|", position, "|", global_position)
	get_tree().quit()
