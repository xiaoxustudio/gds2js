extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	f.store_string("0123456789")
	f.flush()
	print("s|", f.get_len(), "|", f.get_position(), "|", f.is_eof_reached())
	f.close()
	var r := FileAccess.open(p, FileAccess.READ)
	r.seek(3)
	print("a|", r.get_position(), "|", r.get_line())
	r.seek_end(-2)
	print("b|", r.get_position(), "|", r.get_line())
	r.seek(100)
	print("c|", r.get_position(), "|", r.get_line() == "", "|", r.get_error())
	r.close()
	quit()
