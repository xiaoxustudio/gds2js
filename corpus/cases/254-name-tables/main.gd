extends SceneTree

func _initialize():
	for t in range(0, 41):
		print("t|", t, "|", type_string(t), "|", typeof(type_string(t)))
	for e in range(0, 51):
		print("e|", e, "|", error_string(e), "|", typeof(error_string(e)))
	print("e|neg|", error_string(-1), "|", error_string(-9223372036854775808))
	print("e|big|", error_string(9223372036854775807), "|", type_string(9223372036854775807))
	print("k01|", type_string(TYPE_INT), "|", type_string(TYPE_NIL), "|", error_string(0), "|", error_string(16))
	var f = type_string
	var g = error_string
	print("k02|", typeof(f), "|", f, "|", f.get_method(), "|", f.get_argument_count())
	print("k03|", typeof(g), "|", g, "|", g.get_method(), "|", g.get_argument_count())
	print("k04|", hash(type_string), "|", hash("type_string"), "|", type_string == type_string, "|", type_string == error_string)
	print("k05|", f.call(28), "|", g.call(48))
	quit()
