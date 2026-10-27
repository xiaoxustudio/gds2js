extends SceneTree

func _initialize():
	var n := Node.new()
	var m := Node2D.new()
	var r := RefCounted.new()
	print("d|v01|iid|", n.get_instance_id(), "|", typeof(n.get_instance_id()))
	print("d|v02|iid|", r.get_instance_id(), "|", typeof(r.get_instance_id()))
	print("d|v03|", instance_from_id(n.get_instance_id()) == n, "|", is_instance_id_valid(n.get_instance_id()))
	print("d|v04|", n.get_instance_id() == n.get_instance_id(), "|", n.get_instance_id() == m.get_instance_id())
	print("d|v05|", instance_from_id(12345) == null, "|", is_instance_id_valid(12345))
	print("d|v06|", instance_from_id(r.get_instance_id()) == r, "|", typeof(instance_from_id(r.get_instance_id())))
	print("d|v07|", str(instance_from_id(m.get_instance_id())), "|", str(instance_from_id(n.get_instance_id())))
	m.free()
	n.free()
	quit()
