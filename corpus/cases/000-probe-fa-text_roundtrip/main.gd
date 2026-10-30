extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	f.store_string("alpha\nbeta\r\ngamma\n")
	f.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("r|", r != null, "|", r.get_len(), "|", r.get_as_text())
	print("e|", r.eof_reached(), "|", r.get_error(), "|", r.is_open(), "|", r.get_position())
	r.close()
	print("f|", FileAccess.file_exists(p), "|", FileAccess.file_exists("user://nope.txt"))
	quit()
