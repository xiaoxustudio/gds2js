extends SceneTree

func _initialize():
	var a = Color(0.25, 0.5, 0.75, 0.5)
	print("S|", Color.hex(0x123456), "|", Color.hex64(0x1122334455667788), "|", Color.hex(-1), "|", Color.hex(0xFFFFFFFF), "|", Color.hex(4294967296), "|", Color.hex64(-1), "|", Color.hex64(0x7FFFFFFFFFFFFFFF), "|", Color.hex64(281474976710655))
	print("I|", a.hex(0x123456), "|", a.hex64(0x1122334455667788), "|", a.html("80ff00"), "|", a.html_is_valid("zzz"), "|", a.html_is_valid("80ff00"), "|", a.from_string("zzz", Color(0.1, 0.2, 0.3, 0.4)), "|", a.from_hsv(0.25, 0.5, 0.75), "|", a.from_hsv(0.25, 0.5, 0.75, 0.25), "|", typeof(a.hex(1)))
	print("B|", a.blend(Color(0.8, 0.2, 0.4, 1.0)), "|", a.blend(Color(0.8, 0.2, 0.4, 0.0)), "|", a.blend(a), "|", Color(0, 0, 0, 0).blend(Color(0.5, 0.5, 0.5, 0.5)), "|", Color(0, 0, 0, 0).blend(Color(0.5, 0.5, 0.5, 0)), "|", Color(1, 0, 0, 1).blend(Color(0, 1, 0, 0.5)), "|", Color(0.1, 0.2, 0.3, 0.2).blend(Color(0.9, 0.8, 0.7, 0.9)))
	print("BN|", a.blend(Color(NAN, 0.5, 0.5, 0.5)), "|", a.blend(Color(INF, 0.5, 0.5, 1.0)), "|", a.blend(Color(0.5, 0.5, 0.5, INF)))
	quit()
