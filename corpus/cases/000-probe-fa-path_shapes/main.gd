extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	print("p|", f.get_path_absolute())
	f.store_string("x")
	f.close()
	print("q|", FileAccess.open("res://probe.txt", FileAccess.WRITE) != null, "|", FileAccess.get_open_error())
	print("r|", FileAccess.open("", FileAccess.WRITE) == null, "|", FileAccess.get_open_error())
	print("s|", FileAccess.open("user://a/b/c.txt", FileAccess.WRITE) == null, "|", FileAccess.get_open_error())
	quit()
