extends SceneTree

func hit(rx, s):
	var m = rx.search(s)
	if m == null:
		return "null"
	return str(m.get_start()) + "|" + str(m.get_end())

func _initialize():
	var sp = RegEx.new()
	sp.compile("\\s+")
	var np = RegEx.new()
	np.compile("\\S+")
	var cls = RegEx.new()
	cls.compile("[\\s]+")
	var neg = RegEx.new()
	neg.compile("[^\\s]+")
	print("a|", hit(sp, "a\u00A0b"))
	print("b|", hit(sp, "a\u3000b"))
	print("c|", hit(sp, "a\u200Bb"))
	print("d|", hit(sp, "a\u000Bb"))
	print("e|", hit(sp, "a\u000Cb"))
	print("f|", hit(np, "\u00A0"))
	print("g|", hit(np, "\u3000"))
	print("h|", hit(np, "\u200B"))
	print("i|", hit(cls, "a\u00A0b"))
	print("j|", hit(neg, "\u00A0"))
	print("k|", hit(neg, " "))
	print("l|", hit(sp, "a\tb"))
	quit()
