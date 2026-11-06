extends Node2D

func nm(n):
	return "<null>" if n == null else n.name

func _ready():
	var a := get_node("A")
	var b := get_node("B")
	var c := get_node("C")
	print("owner|", nm(get_owner()), "|", nm(a.get_owner()), "|", b.get_owner() == self)
	print("find1|", nm(find_child("B")), "|", nm(find_child("b")), "|", nm(find_child("b", true, false)))
	print("find2|", find_children("*", "", true, false).size(), "|", find_children("*", "Node", true, false).size(), "|", find_children("A*", "", true, false).size())
	print("find4|", nm(b.find_child("B1")), "|", nm(a.find_child("B")), "|", nm(get_node("B/B1").find_child("B1")))
	print("find3|", nm(find_child("B1")), "|", nm(find_child("B1", true, false)), "|", find_children("*", "", false, false).size())
	print("parent|", nm(c.find_parent("B")), "|", nm(get_node("B/B1").find_parent("A")))
	print("path|", get_path_to(b), "|", b.get_path_to(self), "|", get_path_to(self), "|", b.get_path_to(get_node("B/B1")))
	print("anc|", is_ancestor_of(b), "|", b.is_ancestor_of(self), "|", is_ancestor_of(self), "|", b.is_ancestor_of(get_node("B/B1")))
	print("gt|", is_greater_than(a), "|", a.is_greater_than(c), "|", c.is_greater_than(a))
	print("ready|", is_node_ready(), "|", a.is_node_ready())
	var s := Node.new()
	s.name = "S"
	a.add_sibling(s)
	var names := []
	for n in get_children():
		names.append(n.name)
	print("sib|", names)
	b.reparent(c, false)
	print("rep|", nm(b.get_parent()), "|", c.get_child_count(), "|", get_child_count())
	var r := Node.new()
	r.name = "R"
	c.replace_by(r)
	print("repby|", nm(get_node_or_null("R")), "|", get_child_count(), "|", nm(r.get_parent()))
	propagate_call("set_meta", ["k", 7])
	print("prop|", get_meta("k"), "|", get_node("A").get_meta("k"))
	c.free()
	get_tree().quit(0)
