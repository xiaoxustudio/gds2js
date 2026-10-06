extends SceneTree

func _initialize():
	var f = sin
	print("g01|", typeof(f), "|", f.get_method(), "|", f.get_argument_count(), "|", str(f))
	var g = type_exists
	print("g02|", typeof(g), "|", str(g), "|", g.get_argument_count())
	var h = inst_to_dict
	print("g03|", str(h), "|", h.get_argument_count())
	var w = wrap
	print("g04|", str(w), "|", w.get_argument_count())
	var r = rid_allocate_id
	print("g05|", str(r), "|", r.get_argument_count())
	var d = {sin: 1, cos: 2, is_instance_valid: 3}
	print("g06|", d.size(), "|", d.has(sin), "|", d[cos], "|", d.has(wrap))
	print("g07|", hash(sin) == hash("sin"), "|", hash(type_exists) == hash("type_exists"))
	var arr = [nearest_po2, error_string, printerr, var_to_bytes]
	print("g08|", arr.size(), "|", str(arr[0]), "|", str(arr[3]))
	print("g09|", sin == cos, "|", sin == sin, "|", str(sin) == "@GlobalScope::sin")
	print("g10|", typeof(atan2), "|", str(atan2), "|", atan2.get_argument_count())
	quit()
