extends SceneTree

func wipe(path):
	var d = DirAccess.open(path)
	if d == null:
		return 1
	d.list_dir_begin()
	var n = d.get_next()
	while n != "":
		if d.current_is_dir():
			var deep = wipe(path + "/" + n)
			print("w|", n, "|", deep)
		else:
			print("r|", n, "|", d.remove(n))
		n = d.get_next()
	d.list_dir_end()
	return DirAccess.remove_absolute(path)


func _initialize():
	print("a|", DirAccess.make_dir_recursive_absolute("user://t/deep/deeper"))
	var f = FileAccess.open("user://t/deep/deeper/in.txt", FileAccess.WRITE)
	f.store_string("hello")
	f.close()
	print("b|", DirAccess.dir_exists_absolute("user://t/deep/deeper"))
	print("c|", DirAccess.remove_absolute("user://t"), "|", DirAccess.dir_exists_absolute("user://t/deep"))
	print("d|", DirAccess.make_dir_absolute("user://m"), "|", DirAccess.make_dir_absolute("user://m"))
	print("e|", DirAccess.rename_absolute("user://m", "user://mm"), "|", DirAccess.dir_exists_absolute("user://mm"))
	print("f|", DirAccess.remove_absolute("user://gone-dir"), "|", DirAccess.remove_absolute("user://mm"))
	print("g|", wipe("user://seed"), "|", DirAccess.dir_exists_absolute("user://seed"))
	print("h|", wipe("user://t"), "|", DirAccess.dir_exists_absolute("user://t/deep"))
	print("i|", DirAccess.make_dir_recursive_absolute("user://t/deep/deeper"), "|", FileAccess.open("user://t/deep/deeper/back.txt", FileAccess.WRITE) != null)
	quit()
