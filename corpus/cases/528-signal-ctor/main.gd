extends SceneTree
func _initialize():
	var o := Object.new()
	var s := Signal(o, "x")
	print("s|", s.get_name(), "|", s.is_null())
	var z := Signal()
	print("z|", z.get_name(), "|", z.is_null())
	o.free()
	quit()
