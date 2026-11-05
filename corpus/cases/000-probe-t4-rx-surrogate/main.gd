extends SceneTree

func _initialize():
	var s := "a" + String.chr(0xD800) + "b"
	print("a|", s.length(), "|", s.unicode_at(1))
	var rx := RegEx.new()
	rx.compile("\\w+")
	var m = rx.search(s)
	print("b|", m != null)
	if m != null:
		print("b2|", m.get_start(), "|", m.get_end(), "|", m.get_string())
	var m2 = rx.search(s, 2)
	print("c|", m2 != null)
	if m2 != null:
		print("c2|", m2.get_start(), "|", m2.get_end(), "|", m2.get_string())
	quit()
