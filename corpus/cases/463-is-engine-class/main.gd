extends SceneTree

func _initialize():
	var n := Node.new()
	var m := Node2D.new()
	var r := RefCounted.new()
	var vn: Variant = n
	var vm: Variant = m
	var vr: Variant = r
	print("t|v01|", vn is Node, "|", vm is Node, "|", vr is Node)
	print("t|v02|", vn is Node2D, "|", vn is RefCounted, "|", vr is RefCounted)
	print("t|v03|", vn is Object, "|", vr is Object, "|", vn is Resource)
	print("t|v04|", vn.is_class("Node"), "|", vr.is_class("RefCounted"), "|", vm.is_class("Node2D"))
	print("t|v05|", str(vn), "|", String(vn.get_class()))
	m.free()
	n.free()
	quit()
