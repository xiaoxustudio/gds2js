extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	f.store_8(200)
	f.store_16(70000)
	f.store_32(123456789)
	f.store_64(1234567890123)
	f.store_float(1.5)
	f.store_double(0.25)
	f.store_buffer(PackedByteArray([1, 2, 255]))
	f.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("b|", r.get_8(), "|", r.get_16(), "|", r.get_32(), "|", r.get_64(), "|", r.get_float(), "|", r.get_double(), "|", r.get_buffer(3))
	print("c|", r.get_error(), "|", r.get_position(), "|", r.get_len())
	r.close()
	quit()
