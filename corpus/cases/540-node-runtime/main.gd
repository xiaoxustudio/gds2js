extends Node2D

func _ready():
	get_tree().node_added.connect(func(n): print("add|", n.name))
	var b := Node.new()
	b.name = "B"
	add_child(b)
	var c := Node.new()
	c.name = "C"
	b.add_child(c)
	print("sfp|", scene_file_path)
	print("s|", get_tree_string())
	print("p|", get_tree_string_pretty())
	b.print_tree()
	b.print_tree_pretty()
	b.add_to_group("g")
	get_tree().set_group("g", "name", "Z")
	print("sg|", b.name)
	var d := b.duplicate()
	print("d|", d.name, "|", d.get_child_count())
	d.free()
	b.free()
	get_tree().quit(0)
