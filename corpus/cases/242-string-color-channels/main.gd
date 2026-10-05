extends SceneTree

func _initialize():
	print("c01|", Color("red"), "|", Color("web green"), "|", Color("ALICE_BLUE"))
	print("c02|", Color("00ff00"), "|", Color("#1a2b3c"), "|", Color("f00"), "|", Color("#f00f"))
	print("c03|", Color("8f00"), "|", Color("1234"), "|", Color("ffff"), "|", Color("ff00ff00"))
	print("c04|", Color.html("f00f"), "|", Color.html("#80ff0000"), "|", Color.html("1a2b3c"))
	print("c05|", Color.from_string("red", Color(0, 1, 0, 1)), "|", Color.from_string("00ff00", Color(0, 1, 0, 1)))
	print("c06|", Color.html_is_valid("f00"), "|", Color.html_is_valid("8f00"), "|", Color.html_is_valid("ffff"), "|", Color.html_is_valid("#fff"))
	print("c07|", convert("red", TYPE_COLOR), "|", convert("ff0000", TYPE_COLOR), "|", typeof(convert("red", TYPE_COLOR)))
	print("c08|", type_convert("red", TYPE_COLOR), "|", type_convert("80ff0000", TYPE_COLOR))
	print("c09|", convert(&"red", TYPE_COLOR), "|", type_convert(&"red", TYPE_COLOR))
	print("c10|", Color(&"red"), "|", Color.html(&"f00"), "|", Color.html_is_valid(&"f00"))
	print("c11|", Color("red").to_html(true), "|", Color("1a2b3c4d").to_html(false), "|", Color("f00f").to_html(true))
	print("c12|", str(Color("WEB_GREEN")), "|", Color("webgreen") == Color("WEB_GREEN"))
	print("c13|", typeof(Color("red")), "|", [Color("red"), Color("blue")])
	print("c14|", Color("RED") == Color(1, 0, 0, 1), "|", Color("1234") == Color(0.0667, 0.1333, 0.2, 0.2667))
	print("c15|", Color.html_is_valid("f0"), "|", Color.html_is_valid("12345"), "|", Color.html_is_valid("#f0"), "|", Color.html_is_valid("#"))
	quit()
