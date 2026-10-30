extends SceneTree

func _initialize():
	var w := FileAccess.open("user://mt.txt", FileAccess.WRITE)
	w.store_string("hello")
	w.close()
	var r := FileAccess.open("user://mt.txt", FileAccess.READ)
	print("a|", typeof(r.get_modified_time()), "|", r.get_modified_time().size())
	r.close()
	quit()
