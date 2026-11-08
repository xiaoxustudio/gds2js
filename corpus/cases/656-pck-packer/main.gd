extends SceneTree

func hexb(b: PackedByteArray) -> String:
	var s := ""
	for x in b:
		s += "%02x" % x
	return s

func _initialize():
	var f := FileAccess.open("user://a.txt", FileAccess.WRITE)
	f.store_string("hello")
	f.close()
	var g := FileAccess.open("user://b.txt", FileAccess.WRITE)
	g.store_string("hi")
	g.close()
	for al in [16, 64]:
		var p := PCKPacker.new()
		print("s|", al, "|", p.pck_start("user://p" + str(al) + ".pck", al, "0000000000000000000000000000000000000000000000000000000000000000", false))
		print("a|", p.add_file("res://a.txt", "user://a.txt"), "|", p.add_file("res://b.txt", "user://b.txt"))
		print("r|", p.add_file_removal("res://c.txt"))
		print("f|", p.flush(false))
		var r := FileAccess.open("user://p" + str(al) + ".pck", FileAccess.READ)
		var b := r.get_buffer(r.get_length())
		print("d|", al, "|", b.size(), "|", hexb(b))
		r.close()
	quit()
