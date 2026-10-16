extends SceneTree

func _initialize():
	print("A|", "%d %x %X %o" % [7, 255, 255, 8])
	print("B|", "a%c" % 65, "|", "a%c" % "z", "|", "a%c" % 65.9, "|", "a%c" % 1114111)
	print("C|", "%5d|%-5d|%05d|" % [7, 7, -7])
	print("D|", "%*d|" % [3, 7], "%*.*f|" % [2, 3, 1.5], "%*d|" % [-1, 7])
	print("E|", "%v" % Vector2(1, 2), "|", "%v" % Vector3i(1, 2, 3), "|", "%.2v" % Vector2(1, 2))
	print("F|", "%s" % {"k": 1}, "|", "%s" % [1], "|", "%s" % &"a", "|", "%s" % ^"a/b")
	var f = "%d"
	print("G|", f % 42, "|", f % -7.9, "|", f % 1e30)
	print("H|", "100%%" % [], "|", "%d%%" % 50)
	quit()
