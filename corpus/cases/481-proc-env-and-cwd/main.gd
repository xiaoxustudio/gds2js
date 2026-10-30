extends SceneTree

func _initialize():
	print("a|", OS.has_environment("APPDATA"))
	print("b|", OS.get_environment("GDS2JS_PROBE_MISSING") == "")
	print("c|", OS.has_environment("GDS2JS_PROBE_MISSING"))
	print("d|", OS.get_cmdline_user_args())
	print("e|", OS.get_cmdline_user_args().size())
	var sub = DirAccess.open("user://sub")
	print("f|", sub != null, "|", sub.get_current_dir().begins_with("user://"))
	print("g|", sub.get_current_dir(true) == sub.get_current_dir())
	var root = DirAccess.open("user://")
	print("h|", root.get_current_dir() == "user://")
	print("i|", sub.change_dir("user://"), "|", sub.get_current_dir() == "user://")
	var one = DirAccess.open("user://")
	print("j|", one.change_dir("sub"), "|", one.get_current_dir() == "user://sub")
	print("k|", one.change_dir("nope-missing"), "|", one.get_current_dir() == "user://sub")
	print("l|", OS.get_environment("PATH") != "")
	quit()
