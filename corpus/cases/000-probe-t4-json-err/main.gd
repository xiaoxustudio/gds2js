extends SceneTree

func show_err(j: JSON, tag: String):
	print(tag, "|", j.get_error_line(), "|", j.get_error_message(), "|", j.get_data())

func _initialize():
	var j := JSON.new()
	print("a|", j.parse("{"))
	show_err(j, "a2")
	print("b|", j.parse("[1,"))
	show_err(j, "b2")
	print("c|", j.parse(""))
	show_err(j, "c2")
	print("d|", j.parse("tru"))
	show_err(j, "d2")
	print("e|", j.parse("{\n  \"a\": 1,\n  \"b\":\n}"))
	show_err(j, "e2")
	print("f|", j.parse("1 2"))
	show_err(j, "f2")
	print("g|", JSON.parse_string("{"))
	print("i|", JSON.parse_string("{}"))
	quit()
