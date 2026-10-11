extends SceneTree

func _initialize():
	var v: Vector2 = Vector2(3, 4)
	var c: Color = Color(0.25, 0.5, 0.75, 1)
	var a = Vector2i(3, 4)
	print("AA|", v.limit_length(), "|", v.limit_length(2.0), "|", c.to_html(), "|", c.to_html(false), "|", Color.from_hsv(0.5, 1.0, 1.0), "|", Color.from_hsv(0.5, 1.0, 1.0, 0.5), "|", a.snapped(Vector2i(1, 1)), "|", v.rotated(1.0))
	quit()
