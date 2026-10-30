extends SceneTree

func _initialize():
	var r := RegEx.new()
	print("a|", r.compile("^\\d+$"))
	print("b|", r.compile("("))
	print("c|", r.compile(""))
	print("d|", r.get_pattern(), "|", r.get_flags(), "|", r.is_valid())
	print("e|", r.compile("a"))
	print("f|", r.get_pattern())
	quit()
