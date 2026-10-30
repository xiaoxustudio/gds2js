extends SceneTree

func _initialize():
	var f := FileAccess.open("user://src.txt", FileAccess.WRITE)
	f.store_string("payload")
	f.close()
	print("a|", DirAccess.copy("user://src.txt", "user://dst.txt"), "|", DirAccess.copy("user://nope.txt", "user://x.txt"))
	print("b|", DirAccess.rename("user://dst.txt", "user://moved.txt"), "|", FileAccess.file_exists("user://moved.txt"))
	print("c|", DirAccess.remove("user://moved.txt"), "|", DirAccess.remove("user://gone.txt"), "|", DirAccess.file_exists("user://moved.txt"))
	print("d|", DirAccess.make_dir_recursive_absolute("user://a/b/c"), "|", DirAccess.dir_exists_absolute("user://a/b/c"))
	print("e|", DirAccess.remove_absolute("user://a"), "|", DirAccess.make_dir_absolute("user://a"))
	var g := DirAccess.open("user://a")
	print("f|", g == null, "|", typeof(g))
	quit()
