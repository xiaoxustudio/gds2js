extends SceneTree

func _initialize():
	var x := Node.new()
	print("q01|", x.name, "|", x.get_child_count(), "|", x.get_index(), "|", str(x))
	var p := Node.new()
	p.name = "par"
	p.add_child(x)
	print("q02|", x.name, "|", p.get_child_count(), "|", x.get_index(), "|", str(x.get_parent()))
	var b := Node.new()
	b.name = "kid"
	p.add_child(b)
	var clash := Node.new()
	clash.name = "kid"
	p.add_child(clash)
	print("q03|", b.name, "|", clash.name, "|", str(p.get_children()))
	print("q04|", str(p.get_node("kid")), "|", p.get_node_or_null("nope") == null, "|", p.has_node("kid"), "|", x.has_node("kid"))
	b.name = "a:b.c/d"
	print("q05|", b.name, "|", b.get_name(), "|", b.get_class())
	p.move_child(clash, 0)
	print("q06|", clash.get_index(), "|", p.get_child(0) == clash, "|", b.get_index())
	x.free()
	print("q07|", is_instance_valid(x), "|", p.get_child_count())
	p.remove_child(b)
	print("q08|", b.get_parent() == null, "|", p.get_child_count())
	p.add_child(b)
	print("q09|", b.name, "|", p.get_child_count(), "|", str(p))
	var rc := RefCounted.new()
	print("q10|", str(rc), "|", rc.get_class(), "|", typeof(rc))
	var d := {p: 1}
	print("q11|", d[p], "|", p == p, "|", p == b)
	print("q12|", str(b.get_children()), "|", b.is_inside_tree(), "|", p.is_inside_tree())
	p.free()
	quit()
