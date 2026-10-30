extends SceneTree

func _initialize():
	var p := "user://sl.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_line("one")
	w.store_line("two")
	w.store_line("")
	print("l|", w.get_length())
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_length(), "|", r.get_as_text() == "one
two

")
	r.close()
	var r2 := FileAccess.open(p, FileAccess.READ)
	print("b|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line())
	r2.close()
	quit()
