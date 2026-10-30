extends SceneTree

func _initialize():
	print("a|", FileAccess.open("res://", FileAccess.WRITE) == null, "|", FileAccess.get_open_error())
	var d := DirAccess.open("user://")
	print("b|", DirAccess.get_open_error())
	var f := FileAccess.open("user://err.txt", FileAccess.WRITE)
	f.store_string("abc")
	f.close()
	var r := FileAccess.open("user://err.txt", FileAccess.READ)
	r.seek(0)
	print("c|", r.get_32(), "|", r.get_error(), "|", r.get_8(), "|", r.get_error())
	r.close()
	print("d|", r.get_error(), "|", r.is_open(), "|", r.get_buffer(4))
	quit()
