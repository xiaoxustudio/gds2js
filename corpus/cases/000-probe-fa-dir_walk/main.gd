extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	d.make_dir("sub1")
	d.make_dir("sub2")
	var f := FileAccess.open("user://f1.txt", FileAccess.WRITE)
	f.store_string("1")
	f.close()
	var g := FileAccess.open("user://f2.txt", FileAccess.WRITE)
	g.store_string("2")
	g.close()
	var h := DirAccess.open("user://")
	print("a|", h.get_files())
	print("b|", h.get_directories())
	var k := DirAccess.open("user://")
	var seen := []
	k.get_next()
	while k.get_current_dir() != "":
		seen.append(k.get_current_dir())
		k.get_next()
	print("c|", seen)
	print("d|", DirAccess.exists("user://f1.txt"), "|", DirAccess.exists("user://nope.txt"), "|", DirAccess.dir_exists_absolute("user://sub1"))
	quit()
