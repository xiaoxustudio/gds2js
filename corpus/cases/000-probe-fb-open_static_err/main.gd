extends SceneTree

func _initialize():
	print("a|", FileAccess.get_open_error())
	var f := FileAccess.open("user://never.txt", FileAccess.READ)
	print("b|", FileAccess.get_open_error(), "|", f)
	var g := FileAccess.open("user://never.txt", FileAccess.WRITE)
	print("c|", FileAccess.get_open_error(), "|", g != null)
	g.close()
	quit()
