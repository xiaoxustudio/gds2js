extends SceneTree

func _initialize():
	print("a|", FileAccess.READ, "|", FileAccess.WRITE, "|", FileAccess.READ_WRITE, "|", FileAccess.WRITE_READ, "|", typeof(FileAccess.WRITE))
	quit()
