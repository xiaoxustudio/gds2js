extends SceneTree

func take_color(c: Color):
	print("s ", c)

func _initialize():
	var n = 123456789
	take_color(n)
	take_color(-1)
	take_color(4294967296)
	take_color(256)
	take_color(16711680)
	take_color(Color(0.25, 0.5, 0.75))
	var s = "abc"
	take_color(s)
	print("d ", Color(1), " ", Color(255), " ", Color(65280), " ", Color(0), " ", Color(4294967295))
	print("e ", Color("red"), " ", Color("00ff00"), " ", Color("f00"))
	quit()
