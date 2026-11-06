extends SceneTree
func _initialize():
	var n := Node.new()
	n.add_user_signal("x")
	print("h|", n.has_signal("x"), "|", n.has_user_signal("x"))
	n.connect("x", func(a): print("x|", a))
	n.emit_signal("x", 7)
	n.remove_user_signal("x")
	print("r|", n.has_signal("x"))
	n.free()
	quit()
