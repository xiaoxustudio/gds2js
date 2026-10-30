extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_8(-1)
	w.store_16(-2)
	w.store_32(-3)
	w.store_64(-4)
	w.store_float(0.5)
	w.store_double(0.125)
	w.store_string("S")
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_8(), "|", r.get_16(), "|", r.get_32(), "|", r.get_64(), "|", r.get_float(), "|", r.get_double(), "|", r.get_line())
	print("b|", r.get_real(), "|", r.get_bool(), "|", r.get_error())
	r.close()
	quit()
