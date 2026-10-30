extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_string("1234567890")
	print("a|", w.get_length(), "|", w.get_position(), "|", w.eof_reached(), "|", w.is_open())
	w.flush()
	print("b|", w.get_length(), "|", w.get_position())
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("c|", r.get_length(), "|", r.get_position(), "|", r.eof_reached())
	quit()
