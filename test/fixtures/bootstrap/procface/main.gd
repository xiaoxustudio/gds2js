extends SceneTree

func _initialize():
	print("u|", OS.get_cmdline_user_args())
	print("n|", OS.get_cmdline_user_args().size())
	print("e|", OS.get_environment("GDS2JS_PROBE_VAR"))
	print("h|", OS.has_environment("GDS2JS_PROBE_VAR"), "|", OS.has_environment("GDS2JS_PROBE_NOPE"))
	print("m|", OS.get_environment("GDS2JS_PROBE_NOPE") == "")
	print("t|", OS.get_cmdline_user_args()[0] == "alpha")
	quit()
