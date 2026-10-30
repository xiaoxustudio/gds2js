extends SceneTree

func _initialize():
	var p := "user://probe.txt"
	var f := FileAccess.open(p, FileAccess.WRITE)
	print("w|", f != null, "|", typeof(f), "|", FileAccess.get_open_error())
	f.store_var({"a": 1, "b": [1.5, "s"]})
	f.store_var(5)
	f.store_var(null)
	f.close()
	var r := FileAccess.open(p, FileAccess.READ)
	print("v|", r.get_var(), "|", r.get_var(), "|", r.get_var(), "|", r.eof_reached())
	print("w|", r.get_var(), "|", r.get_error())
	quit()
