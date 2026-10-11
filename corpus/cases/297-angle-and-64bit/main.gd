extends SceneTree

func _initialize():
	var v = Vector2(1, 2)
	var w = Vector3(1, 2, 3)
	print("FA|", v.from_angle(0.0), "|", v.from_angle(1.5707963267949), "|", v.from_angle(-2.5), "|", v.from_angle(3.14159265358979), "|", typeof(v.from_angle(0.5)), "|", v.from_angle(1e7))
	print("SA|", w.signed_angle_to(Vector3(0, 1, 0), Vector3(0, 0, 1)), "|", w.signed_angle_to(Vector3(1, 0, 0), Vector3(0, 1, 0)), "|", w.signed_angle_to(w, Vector3(0, 0, 1)), "|", w.signed_angle_to(Vector3(-1, -2, -3), Vector3(0, 0, 1)), "|", w.signed_angle_to(Vector3(1e7, 2e7, 3e7), Vector3(0, 0, 1)))
	print("SA2|", Vector3(1, 0, 0).signed_angle_to(Vector3(0, 1, 0), Vector3(0, 0, 1)), "|", Vector3(1, 0, 0).signed_angle_to(Vector3(0, 1, 0), Vector3(0, 0, -1)), "|", Vector3(1, 0, 0).signed_angle_to(Vector3(0, -1, 0), Vector3(0, 0, 1)), "|", Vector3(1, 0, 0).signed_angle_to(Vector3(1, 1, 0), Vector3(0, 0, 1)))
	for c in [Color(0.25, 0.5, 0.75, 1), Color(0, 0, 0, 0), Color(1, 1, 1, 1), Color(0.0000076295, 0.5, 0.99999, 0.5), Color(-0.2, 1.5, NAN, 0.5), Color(INF, -INF, 0.5, 1)]:
		print("C64|", c.to_rgba64(), "|", c.to_argb64(), "|", c.to_abgr64(), "|", typeof(c.to_rgba64()))
	for c in [Color(-0.2, 1.5, NAN, 0.5), Color(INF, -INF, 0.5, 1), Color(0.25, 0.5, 0.75, 1), Color(1.0039, 260, -1, 0.5)]:
		print("C32|", c.to_rgba32(), "|", c.to_argb32(), "|", c.to_abgr32(), "|", c.r8, "|", c.g8, "|", c.b8, "|", c.a8, "|", typeof(c.to_rgba32()))
	print("HT|", Color(-0.2, 1.5, 0.5, 1).to_html(), "|", Color(1.0039, 0.996, -1, 0.5).to_html(), "|", Color(NAN, 0.5, 0.5, 0.5).to_html())
	quit()
