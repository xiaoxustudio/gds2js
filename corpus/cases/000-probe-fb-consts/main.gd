extends SceneTree

func _initialize():
	print("a|", FileAccess.READ, "|", FileAccess.WRITE, "|", FileAccess.READ_WRITE, "|", FileAccess.WRITE_READ)
	print("b|", FileAccess.READ_TEXT, "|", FileAccess.WRITE_TEXT, "|", FileAccess.READ_WRITE_TEXT, "|", FileAccess.WRITE_READ_TEXT)
	quit()
