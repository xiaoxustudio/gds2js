extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_line("one")
	w.store_line(2)
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_as_text())
	r.close()
	quit()
