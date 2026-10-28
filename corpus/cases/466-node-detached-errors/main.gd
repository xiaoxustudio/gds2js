extends SceneTree

func _initialize():
	var n := Node.new()
	print("e|q1|", String(n.get_path()), "|", n.get_path().is_empty(), "|", n.get_tree())
	var p := Node.new()
	p.name = "par"
	print("e|q2|", p.get_path() == NodePath(""), "|", String(p.get_path()), "|", p.has_node("x"))
	n.free()
	p.free()
	quit()
