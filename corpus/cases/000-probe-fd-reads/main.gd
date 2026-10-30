extends SceneTree

func _initialize():
	var p := "user://r.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_32(7)
	w.store_string("A
B")
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_32(), "|", r.get_real(), "|", r.get_line(), "|", r.get_line(), "|", r.get_error())
	var r2 := FileAccess.open(p, FileAccess.READ)
	print("b|", typeof(r2.get_var()), "|", r2.get_var())
	print("c|", r2.get_length(), "|", r2.get_position(), "|", r2.is_open(), "|", r2.get_remaining_buffer().size() if false else 0)
	r2.close()
	quit()
