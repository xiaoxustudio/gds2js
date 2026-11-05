extends SceneTree

func _initialize():
	print("a|", OS.get_name())
	OS.set_environment("GDS2JS_T4", "v1")
	print("b|", OS.get_environment("GDS2JS_T4"), "|", OS.has_environment("GDS2JS_T4"))
	OS.set_environment("GDS2JS_T4", "")
	print("c|", OS.has_environment("GDS2JS_T4"), "|", OS.get_environment("GDS2JS_T4") == "")
	print("d|", OS.get_executable_path() != "")
	print("e|", OS.get_cmdline_args().size() > 0)
	quit()
