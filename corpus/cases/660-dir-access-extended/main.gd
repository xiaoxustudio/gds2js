extends SceneTree

func _initialize():
	var f := FileAccess.open("user://a.txt", FileAccess.WRITE)
	f.store_string("x")
	f.close()
	var d := DirAccess.open("user://")
	print("d1|", d.get_include_hidden(), "|", d.get_include_navigational())
	d.set_include_hidden(true)
	d.set_include_navigational(true)
	print("d2|", d.include_hidden, "|", d.include_navigational, "|", d.get_include_hidden(), "|", d.get_include_navigational())
	print("d3|", d.get_space_left() > 0, "|", d.get_filesystem_type() != "", "|", d.is_case_sensitive("user://"), "|", d.is_bundle("user://"))
	print("d4|", d.create_link("user://a.txt", "user://a-link.txt"))
	print("d5|", d.is_link("user://a-link.txt"), "|", d.read_link("user://a-link.txt").ends_with("/a.txt"), "|", d.is_equivalent("user://a.txt", "user://a-link.txt"))
	var t := DirAccess.create_temp("daprobe", true)
	print("d6|", t != null, "|", DirAccess.dir_exists_absolute(t.get_current_dir()))
	quit()
