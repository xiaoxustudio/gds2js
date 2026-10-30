extends SceneTree

func _initialize():
	var f := FileAccess.open("user://t.txt", FileAccess.WRITE)
	print("a|", f.get_class(), "|", f is FileAccess, "|", f is RefCounted, "|", f is Object, "|", f.is_class("FileAccess"), "|", typeof(f))
	print("b|", str(f))
	f.store_string("x")
	f.close()
	print("c|", str(f), "|", f.get_position())
	FileAccess.open("user://t.txt", FileAccess.WRITE)
	print("d|", typeof(FileAccess), "|", str(FileAccess))
	quit()
