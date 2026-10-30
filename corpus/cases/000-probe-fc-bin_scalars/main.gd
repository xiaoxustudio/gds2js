extends SceneTree

func _initialize():
	var p := "user://b.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_8(200)
	w.store_16(70000)
	w.store_32(-7)
	w.store_64(1234567890123)
	w.store_float(1.25)
	w.store_double(0.125)
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_8(), "|", r.get_16(), "|", r.get_32(), "|", r.get_64(), "|", r.get_float(), "|", r.get_double())
	print("b|", r.get_real(), "|", r.get_bool(), "|", r.get_error(), "|", r.eof_reached())
	r.close()
	quit()
