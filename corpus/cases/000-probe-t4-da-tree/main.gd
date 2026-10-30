extends SceneTree

func _initialize():
	var d = DirAccess.open("user://seed")
	print("a|", d != null, "|", d.file_exists("one.txt"))
	print("b|", d.rename("one.txt", "ren.txt"), "|", d.file_exists("ren.txt"), "|", d.file_exists("one.txt"))
	print("c|", d.copy("ren.txt", "cop.txt"), "|", d.file_exists("cop.txt"))
	print("d|", d.make_dir("sub"), "|", d.dir_exists("sub"))
	var inner = d.get_next()
	print("e|", d.remove("ren.txt"), "|", d.remove("cop.txt"), "|", d.remove("nope.txt"))
	print("f|", d.copy("nope.txt", "x.txt"), "|", d.rename("nope.txt", "x.txt"))
	var w = DirAccess.open("user://seed")
	w.list_dir_begin()
	var seen = []
	while w.get_next() != "":
		if not w.current_is_dir():
			seen.append(w.get_current_dir())
	print("g|", seen.size())
	quit()
