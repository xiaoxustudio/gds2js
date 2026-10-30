extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_string("abcdef")
	w.seek(1)
	w.store_string("XY")
	print("a|", w.get_position(), "|", w.get_length())
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("b|", r.get_as_text())
	r.close()
	quit()
