extends SceneTree

func _initialize():
	var n := Node2D.new()
	print("m|a1|", n.position, "|", n.rotation, "|", n.scale, "|", n.transform)
	n.position = Vector2(1.5, -2.25)
	print("m|a2|", n.position, "|", n.transform, "|", n.global_position)
	n.rotation = 1.0
	print("m|a3|", n.rotation, "|", n.transform)
	n.scale = Vector2(2, 0.5)
	print("m|a4|", n.scale, "|", n.transform, "|", n.position)
	n.transform = Transform2D(0, Vector2(7, 8))
	print("m|a5|", n.position, "|", n.rotation, "|", n.scale)
	n.rotation_degrees = 90.0
	print("m|a6|", n.rotation, "|", n.rotation_degrees, "|", n.transform)
	print("m|a7|", n.visible, "|", n.is_visible_in_tree())
	n.hide()
	print("m|a8|", n.visible)
	n.show()
	print("m|a9|", n.visible)
	n.visible = false
	print("m|a10|", n.visible, "|", n.is_visible_in_tree())
	var p := Node2D.new()
	p.position = Vector2(3, 4)
	p.rotation = 1.5707963705062866
	var c := Node2D.new()
	p.add_child(c)
	c.position = Vector2(1, 1)
	print("m|b1|", c.position, "|", c.global_position, "|", c.get_global_transform())
	c.global_position = Vector2(0, 0)
	print("m|b2|", c.position, "|", c.transform)
	print("m|b3|", n.z_index, "|", n.top_level, "|", n.y_sort_enabled)
	n.free()
	p.free()
	quit()
