extends SceneTree

func hexb(b: PackedByteArray) -> String:
	var s := ""
	for x in b:
		s += "%02x" % x
	return s

func _initialize():
	for m in [0, 1, 2, 3]:
		var w := FileAccess.open_compressed("user://cm" + str(m) + ".bin", FileAccess.WRITE, m)
		w.store_string("hello")
		w.close()
		print("m|", m, "|", hexb(FileAccess.get_file_as_bytes("user://cm" + str(m) + ".bin")))
		var r := FileAccess.open_compressed("user://cm" + str(m) + ".bin", FileAccess.READ, m)
		print("r|", m, "|", r.get_as_text())
		r.close()
	var big := FileAccess.open_compressed("user://big.bin", FileAccess.WRITE, 1)
	big.store_string("x".repeat(5000))
	big.close()
	var br := FileAccess.open_compressed("user://big.bin", FileAccess.READ, 1)
	print("b|", br.get_as_text().length(), "|", br.get_length())
	br.close()
	quit()
