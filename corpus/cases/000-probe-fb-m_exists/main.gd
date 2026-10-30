extends SceneTree

func _initialize():
	print("a|", FileAccess.file_exists("user://nope.txt"), "|", typeof(FileAccess.file_exists("user://nope.txt")))
	var w := FileAccess.open("user://here.txt", FileAccess.WRITE)
	w.store_string("1")
	w.close()
	print("b|", FileAccess.file_exists("user://here.txt"))
	print("c|", FileAccess.file_exists("user://"), "|", FileAccess.file_exists(""))
	quit()
