extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	print("a|", d != null, "|", d.get_class(), "|", typeof(d), "|", str(d))
	print("b|", d.get_current_dir(), "|", d.is_read_only())
	var r := DirAccess.open("user://no-such-dir-here")
	print("c|", r == null, "|", typeof(r), "|", DirAccess.get_open_error())
	quit()
