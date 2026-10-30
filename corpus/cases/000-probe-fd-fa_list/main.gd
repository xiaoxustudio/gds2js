extends SceneTree

func _initialize():
	var f := FileAccess.open("user://x.bin", FileAccess.WRITE)
	var names := []
	for e in f.get_method_list():
		names.append(e["name"])
	names.sort()
	print("a|", ";".join(names))
	f.close()
	quit()
