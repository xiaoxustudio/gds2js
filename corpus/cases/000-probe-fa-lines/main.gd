extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	f.store_string("a\nb\r\nc\n\nz")
	f.close()
	var r := FileAccess.open(p, FileAccess.READ)
	for i in range(6):
		print("l|", i, "|", r.get_line(), "|", r.eof_reached())
	quit()
