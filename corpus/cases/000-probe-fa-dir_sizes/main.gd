extends SceneTree

func _initialize():
	var f := FileAccess.open("user://sized.txt", FileAccess.WRITE)
	f.store_string("12345")
	f.close()
	var d := DirAccess.open("user://")
	print("a|", d.get_size("sized.txt"), "|", d.get_size("nope.txt"))
	print("b|", d.get_access("sized.txt"), "|", typeof(d.get_access("sized.txt")))
	print("c|", d.is_other_open("sized.txt"))
	print("d|", d.get_path_focus())
	quit()
