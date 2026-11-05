extends SceneTree

func _initialize():
	var a := RegEx.new()
	a.compile("^\\d+$")
	var ma = a.search("12\n")
	print("a|", ma != null)
	if ma != null:
		print("a2|", ma.get_start(), "|", ma.get_end(), "|", ma.get_string())
	var mb = a.search("12\n34")
	print("b|", mb != null)
	if mb != null:
		print("b2|", mb.get_start(), "|", mb.get_end(), "|", mb.get_string())
	var cm = a.search("34")
	print("c|", cm != null)
	if cm != null:
		print("c2|", cm.get_start(), "|", cm.get_end(), "|", cm.get_string())

	var w := RegEx.new()
	w.compile("\\w+")
	var mw = w.search("héllo")
	print("d|", mw != null, "|", mw.get_string(), "|", mw.get_start(), "|", mw.get_end())

	var dg := RegEx.new()
	dg.compile("\\d+")
	var md = dg.search("a٣b")
	print("e|", md != null, "|", md.get_string(), "|", md.get_start(), "|", md.get_end())
	quit()
