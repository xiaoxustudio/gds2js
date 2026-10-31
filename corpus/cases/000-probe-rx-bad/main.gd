extends SceneTree

func _initialize():
	var r = RegEx.new()
	print("a|", r.compile("("), "|", r.compile("["), "|", r.compile("*"))
	print("b|", r.compile("(?<n>a)(?<n>b)"), "|", r.compile("\\p{L}"), "|", r.compile("(?i)a"))
	print("c|", r.compile("a{2,1}"), "|", r.compile("\\Q"), "|", r.compile("(?P<n>a)"), "|", r.compile("\\1"))
	print("d|", r.compile("a"), "|", r.get_pattern(), "|", r.is_valid())
	quit()
