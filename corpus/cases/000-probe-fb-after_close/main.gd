extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_string("abc")
	w.close()
	print("a|", w.is_open(), "|", w.get_position(), "|", w.get_error(), "|", w.get_length())
	print("b|", w.get_line(), "|", w.get_error())
	w.store_string("z")
	print("c|", w.get_error())
	w.close()
	quit()
