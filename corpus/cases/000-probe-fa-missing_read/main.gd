extends SceneTree

func _initialize():
	var f := FileAccess.open("user://never-here.txt", FileAccess.READ)
	print("a|", f == null, "|", typeof(f), "|", FileAccess.get_open_error())
	quit()
