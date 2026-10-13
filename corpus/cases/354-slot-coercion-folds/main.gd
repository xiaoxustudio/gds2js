extends SceneTree

func _initialize():
	var s: String = "abc"
	print("A|", s.substr(1.9, 1), "|", s.left(true), "|", s.repeat(-0.5), "|", s.repeat(1.5), "|", s.right(2.5))
	print("B|", s.contains(&"abc"), "|", s.contains(^"abc"), "|", s.replace(^"a", "Z"), "|", s.begins_with(&"a"), "|", s.ends_with(^"c"))
	print("C|", s.get_slice(&"b", 1), "|", s.split("x", true, 1.5), "|", s.count(&"a", 0, 3), "|", s.find(^"b"), "|", s.insert(1.5, "z"))
	var a: Array = [1, 2, 3]
	print("D|", a.slice(1.0, 3.0), "|", a.find(2, true), "|", a.pop_at(1.5), "|", a.size())
	a.insert(1.5, 9)
	print("E|", a, "|", a.size())
	a.resize(2.9)
	print("F|", a)
	var d: Dictionary = {"a": 1}
	print("G|", d.set("a", 2), "|", d.set(1, 5), "|", d)
	var v2: Vector2 = Vector2(1, 2)
	print("H|", v2.angle_to(Vector2i(3, 4)), "|", v2.distance_to(Vector2i(1, 1)), "|", v2.lerp(Vector2i(3, 4), true))
	var v2i: Vector2i = Vector2i(1, 2)
	print("I|", v2i.max(Vector2(1, 2)), "|", v2i.snapped(Vector2(1.5, 2.5)), "|", v2i.clampi(true, 1), "|", v2i.distance_to(Vector2(1, 2)))
	var v3: Vector3 = Vector3(1, 2, 3)
	print("J|", v3.signed_angle_to(Vector3i(1, 2, 3), Vector3(0, 1, 0)), "|", v3.clampf(1, 2.5), "|", v3.bezier_derivative(Vector3i(1, 2, 3), Vector3(1, 2, 3), Vector3(2, 2, 2), true))
	var v3i: Vector3i = Vector3i(1, 2, 3)
	print("K|", v3i.snapped(Vector3(1.5, 2.5, 3.5)), "|", v3i.min(Vector3(2, 3, 4)))
	var c: Color = Color(0.5, 0.25, 0.75, 1)
	print("L|", c.blend(1), "|", c.clamp(1, Color(0.2, 0.2, 0.2, 1)), "|", c.from_hsv(true, 1, 1))
	print("M|", c.to_html(128), "|", c.to_html(false), "|", c.html(^"808080"))
	quit()
