extends SceneTree

func _initialize():
	var p3 := "user://wt.txt"
	var w := FileAccess.open(p3, FileAccess.WRITE_TEXT)
	w.store_string("x\ny\rz")
	w.store_line("L1")
	w.close()
	var raw := FileAccess.open(p3, FileAccess.READ)
	print("a|", raw.get_as_text())
	print("b|", raw.get_length())
	raw.close()
	quit()
