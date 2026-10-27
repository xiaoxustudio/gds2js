extends SceneTree

func _initialize():
	var c := Control.new()
	print("c|a1|", c.position, "|", c.size, "|", c.rotation, "|", c.scale, "|", c.pivot_offset, "|", c.visible)
	c.position = Vector2(3, 4)
	c.size = Vector2(10, 20)
	c.rotation = 0.5
	c.scale = Vector2(2, 2)
	c.pivot_offset = Vector2(1, 1)
	print("c|a2|", c.position, "|", c.size, "|", c.rotation, "|", c.scale, "|", c.pivot_offset, "|", c.global_position)
	var p := Control.new()
	c.add_child(p)
	p.position = Vector2(1, 1)
	p.size = Vector2(5, 5)
	print("c|a3|", p.global_position, "|", p.size, "|", p.get_global_transform())
	c.visible = false
	c.hide()
	print("c|a4|", c.visible)
	c.show()
	print("c|a5|", c.visible, "|", c.get_class(), "|", str(c))
	p.free()
	c.free()
	quit()
