extends SceneTree

func show(tag, rx, s, from = 0):
	var m = rx.search(s, from)
	if m == null:
		print(tag, "|null")
	else:
		print(tag, "|", m.get_start(), "|", m.get_end(), "|", m.get_string())

func _initialize():
	var s = "a😀c"
	var d = RegEx.new()
	d.compile("a.c")
	show("a", d, s)
	show("b", d, s, 1)
	var w = RegEx.new()
	w.compile("\\w+")
	show("c", w, s)
	var all = RegEx.new()
	all.compile("a.c")
	for m in all.search_all(s + " " + s):
		print("d|", m.get_start(), "|", m.get_end(), "|", m.get_string())
	var sep = RegEx.new()
	sep.compile("[^,]+")
	print("e|", sep.sub("a😀,b", "#"))
	print("f|", sep.sub("a😀,b", "#", 1, 1))
	quit()
