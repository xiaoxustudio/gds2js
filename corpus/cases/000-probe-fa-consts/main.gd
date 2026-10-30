extends SceneTree

func _initialize():
	print("a|", FileAccess.READ, "|", FileAccess.WRITE, "|", FileAccess.READ_WRITE, "|", FileAccess.WRITE_READ, "|", FileAccess.READ_WRITE_FLUSH, "|", typeof(FileAccess.WRITE))
	print("b|", OK, "|", ERR_FILE_NOT_FOUND, "|", ERR_FILE_BAD_PATH, "|", ERR_FILE_UNRECOGNIZED, "|", ERR_ACCESS_DENIED, "|", ERR_FILE_EOF, "|", ERR_DOES_EXIST)
	quit()
