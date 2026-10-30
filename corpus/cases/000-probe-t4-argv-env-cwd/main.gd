extends SceneTree

func _initialize():
	print("a|", OS.get_cmdline_args())
	print("b|", OS.get_cmdline_user_args())
	print("c|", "[", OS.get_environment("GDS2JS_PROBE_MISSING"), "]")
	print("d|", OS.has_environment("PATH"), "|", OS.get_environment("PATH") != "")
	print("e|", OS.has_environment("APPDATA"), "|", OS.get_environment("APPDATA") != "")
	print("f|", OS.has_environment("GDS2JS_PROBE_MISSING"))
	var dot = DirAccess.open(".")
	print("g|", dot != null, "|", dot.get_current_dir())
	var up = DirAccess.open("..")
	print("h|", up != null, "|", up.get_current_dir() != dot.get_current_dir())
	print("i|", OS.get_executable_path() != "")
	print("j|", Time.get_ticks_msec() >= 0)
	print("k|", OS.get_cmdline_args().size(), "|", OS.get_cmdline_user_args().size())
	quit()
