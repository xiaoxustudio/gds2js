extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_buffer(PackedByteArray([1, 2, 3]))
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_32(), "|", r.get_error(), "|", r.get_8(), "|", r.get_error(), "|", r.eof_reached())
	print("b|", r.get_buffer(4))
	r.close()
	quit()
