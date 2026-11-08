extends SceneTree

func _initialize():
	print("j1|", JSON.from_native(7), "|", JSON.from_native(2.5), "|", JSON.from_native("a"))
	print("j2|", JSON.stringify(JSON.from_native(Vector2(1, 2))), "|", JSON.stringify(JSON.from_native(Color(0.1, 0.2, 0.3, 0.4))))
	print("j3|", JSON.to_native("i:7"), "|", JSON.to_native("f:2.5"), "|", JSON.to_native(JSON.from_native(Vector2(1, 2))))
	var j := JSON.new()
	j.parse("{\"a\": 1}")
	print("j4|", j.get_parsed_text())
	j.parse("{\"a\": 1}", true)
	print("j5|", j.get_parsed_text(), "|", JSON.stringify(j.data))
	j.set_data(5)
	print("j6|", j.get_data(), "|", j.data)
	var rx := RegEx.create_from_string("(?<user>\\w+)@(?<host>\\w+)")
	var m := rx.search("mail bob@site")
	print("r1|", m.get_string(), "|", m.subject, "|", m.strings, "|", JSON.stringify(m.names))
	quit()
