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
	var w := RegEx.new()
	w.compile("\\w+")
	var mw = w.search("héllo")
	print("c|", mw != null, "|", mw.get_string(), "|", mw.get_start(), "|", mw.get_end())
	var dg := RegEx.new()
	dg.compile("\\d+")
	var md = dg.search("a٣b")
	print("d|", md != null)
	quit()
