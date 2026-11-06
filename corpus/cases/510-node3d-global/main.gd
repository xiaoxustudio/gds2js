extends Node3D

func _ready():
	position = Vector3(1, 2, 3)
	rotation = Vector3(0.1, 0.2, 0.3)
	var c = get_node("C")
	c.position = Vector3(4, 5, 6)
	c.rotation = Vector3(0.2, 0.1, 0.4)
	print("g|", c.global_position, "|", c.global_rotation)
	print("gt|", c.global_transform)
	print("tg|", c.to_global(Vector3(1, 2, 3)))
	print("p|", c.get_parent_node_3d().name)
	c.translate(Vector3(1, 0, 0))
	print("tr|", c.position)
	c.orthonormalize()
	print("on|", c.basis)
	get_tree().quit(0)
