extends SceneTree

func _initialize():
	DirAccess.make_dir_recursive_absolute("user://dwork/sub")
	var f := FileAccess.open("user://dwork/a.txt", FileAccess.WRITE)
	f.close()
	var g := FileAccess.open("user://dwork/b.txt", FileAccess.WRITE)
	g.close()
	print("e|", DirAccess.get_files_at("user://dwork"))
	print("f|", DirAccess.get_directories_at("user://dwork"))
	quit()
