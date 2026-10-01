extends SceneTree

@warning_ignore("unused_parameter")
func add3(a, b, c):
	return str(a, "-", b, "-", c)

func _initialize():
	var cb = add3.bind("x")
	print("r ", cb.call("y", "z"))
	print("r2 ", add3.bind("x", "y").call("z"))
	print("r3 ", add3.bind("m").bind("n").call("p"))
	var full = add3.bind("x", "y", "z")
	print("r4 ", full.call(), " ", full.get_bound_arguments(), " ", full.get_argument_count(), " ", full.get_method())
	print("r5 ", cb.callv(["y", "z"]))
	print("r6 ", cb.is_valid(), " ", cb.get_bound_arguments().size())
	quit()
