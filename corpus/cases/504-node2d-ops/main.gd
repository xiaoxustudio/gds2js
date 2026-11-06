extends Node2D

func _ready():
	position = Vector2(10, 20)
	rotation = 0.5
	scale = Vector2(2, 3)
	var p = get_node("P")
	p.position = Vector2(3, 4)
	p.rotation = 0.25
	p.scale = Vector2(2, 3)
	print("origin|", position, "|", p.position, "|", p.global_position)
	print("local|", p.to_local(Vector2(10, 20)), "|", p.to_global(Vector2(1, 2)))
	p.rotate(0.5)
	print("rot|", p.position, "|", p.rotation, "|", p.scale)
	p.translate(Vector2(1, 2))
	print("trans|", p.position, "|", p.rotation)
	p.move_local_x(2)
	p.move_local_y(3, true)
	print("move|", p.position, "|", p.scale)
	p.apply_scale(Vector2(2, 0.5))
	print("scale|", p.position, "|", p.rotation, "|", p.scale)
	print("rel|", p.get_relative_transform_to_parent(self))
	get_tree().quit(0)
