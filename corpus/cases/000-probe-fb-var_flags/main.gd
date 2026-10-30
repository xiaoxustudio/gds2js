extends SceneTree

func _initialize():
	var p := "user://f.bin"
	var w := FileAccess.open(p, FileAccess.WRITE)
	w.store_var([1, "a"], true)
	w.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("a|", r.get_var(), "|", r.get_var(true), "|", r.get_error())
	r.close()
	var s := FileAccess.open(p, FileAccess.READ)
	print("b|", s.get_32())
	s.close()
	quit()
