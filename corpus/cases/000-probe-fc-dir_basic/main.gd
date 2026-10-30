extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	print("a|", d.get_files(), "|", d.get_directories())
	print("b|", d.file_exists("seed.txt"), "|", d.dir_exists("sub"), "|", d.get_current_dir())
	d.list_dir_begin()
	var seen := []
	var n := d.get_next()
	while n != "":
		seen.append(n)
		n = d.get_next()
	d.list_dir_end()
	print("c|", seen)
	quit()
