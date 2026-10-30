extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	print("a|", d.get_files())
	print("b|", typeof(d.get_files()), "|", d.get_files().size())
	d.list_dir_begin()
	var seen := []
	var n := d.get_next()
	while n != "":
		seen.append(n + "/" if d.current_is_dir() else n)
		n = d.get_next()
	d.list_dir_end()
	print("c|", seen)
	print("d|", DirAccess.get_open_error(), "|", d.is_read_only(), "|", d.get_access("seed.txt"), "|", d.get_size("seed.txt"))
	quit()
