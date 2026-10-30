extends SceneTree

func fresh():
	var f = FileAccess.open("user://f.txt", FileAccess.READ)
	f.close()
	return f


func _initialize():
	var f = fresh()
	print("a|", f.is_open(), "|", f.get_position(), "|", f.get_length())
	print("b|", f.get_error())
	print("c|", f.eof_reached())
	print("d|", "[" + f.get_line() + "]", "|", f.get_position())
	print("e|", f.get_8(), "|", f.get_buffer(2).size())
	f.seek(0)
	print("g|", f.get_position())
	var w = FileAccess.open("user://w.txt", FileAccess.WRITE)
	w.close()
	w.store_8(65)
	w.flush()
	print("h|", w.is_open(), "|", FileAccess.file_exists("user://w.txt"))
	f.close()
	print("i|", f.is_open())
	print("j|", fresh().get_as_text().length())
	quit()
