extends SceneTree

func _initialize():
	var p2 := "user://t.txt"
	var w := FileAccess.open(p2, FileAccess.WRITE)
	w.store_string("a\nb\r\nc\r\nd")
	w.close()
	var r := FileAccess.open(p2, FileAccess.READ)
	print("a|", r.get_as_text())
	var r2 := FileAccess.open(p2, FileAccess.READ_TEXT)
	print("b|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line())
	var r3 := FileAccess.open(p2, FileAccess.READ)
	print("c|", r3.get_line(), "|", r3.get_line(), "|", r3.get_line(), "|", r3.get_line())
	print("d|", r3.get_length(), "|", r3.get_position())
	quit()
