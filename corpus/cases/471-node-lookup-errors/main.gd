extends SceneTree

func _initialize():
	var p := Node.new()
	p.name = "P"
	var c := Node.new()
	c.name = "C"
	p.add_child(c)
	print("x|a1|", p.get_child_count())
	var oob = p.get_child(5)
	print("x|a2|", oob == null)
	var miss = p.get_node_or_null("Nope")
	print("x|a3|", miss == null)
	var miss2 = p.get_node("Nope")
	print("x|a4|", miss2 == null)
	p.move_child(c, 3)
	print("x|a5|", p.get_child_count(), "|", c.get_index(), "|", str(p.get_children()))
	c.free()
	p.free()
	quit()
