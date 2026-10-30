extends SceneTree

func _initialize():
	var p := "user://nl.txt"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_string("a\nb\r\nc\rd")
	print("a|", w.get_length())
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("b|", r.get_length(), "|", r.get_as_text() == "a\nb\r\nc\rd")
	var r2 := FileAccess.open(p, FileAccess.READ)
	print("c|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line(), "|", r2.get_line())
	var r3 := FileAccess.open(p, FileAccess.READ)
	print("d|", r3.get_csv_line(","))
	r3.close()
	quit()
