extends SceneTree

func _initialize():
	var pz: float = 0.0
	var nz: float = pz * -1.0
	for v in [Vector2(pz, nz), Vector2(-1.5, 2.5), Vector2(NAN, 1), Vector2(INF, -INF), Vector2(0.49999997, 1.5)]:
		print("V2A|", v.sign(), "|", v.abs(), "|", v.floor(), "|", v.ceil(), "|", v.round(), "|", v.aspect(), "|", v.length(), "|", v.length_squared(), "|", v.is_normalized(), "|", v.is_finite(), "|", v.is_zero_approx())
		print("V2B|", v.lerp(Vector2(1, -1), 0.3), "|", v.slerp(Vector2(1, -1), 0.3), "|", v.snapped(Vector2(0.5, 0.5)), "|", v.limit_length(1.7), "|", v.normalized(), "|", v.rotated(0.3), "|", v.move_toward(Vector2(0.3, -0.7), 1.3))
		print("V2C|", v.dot(Vector2(2.5, 3.5)), "|", v.cross(Vector2(2.5, 3.5)), "|", v.distance_to(Vector2(0.3, -0.7)), "|", v.angle_to(Vector2(2.5, 3.5)), "|", v.direction_to(Vector2(0.3, -0.7)), "|", v.cubic_interpolate(Vector2(0.3, -0.7), Vector2(2.5, 2.5), Vector2(-1.5, 4.5), 0.3), "|", v.bezier_interpolate(Vector2(0.3, -0.7), Vector2(2.5, 2.5), Vector2(-1.5, 4.5), 0.3))
	for v in [Vector2i(3, -4), Vector2i(-1, 1), Vector2i(2147483647, -2147483648), Vector2i(0, 0)]:
		print("V2I|", v.sign(), "|", v.abs(), "|", v.min(Vector2i(2, -2)), "|", v.max(Vector2i(2, -2)), "|", v.snapped(Vector2i(0, 5)), "|", v.length_squared(), "|", v.aspect(), "|", v.distance_to(Vector2i(7, 9)), "|", v.clampi(-2, 2), "|", v.snappedi(5))
	for v in [Vector3(pz, nz, 1.5), Vector3(-1.5, 2.5, -0.3), Vector3(NAN, 1, 2), Vector3(INF, -INF, 0), Vector3(0.49999997, 1.5, 2.5)]:
		print("V3A|", v.sign(), "|", v.abs(), "|", v.floor(), "|", v.ceil(), "|", v.round(), "|", v.length(), "|", v.length_squared(), "|", v.inverse(), "|", v.is_normalized(), "|", v.min_axis_index(), "|", v.max_axis_index())
		print("V3B|", v.lerp(Vector3(1, -1, 2), 0.3), "|", v.snappedf(0.5), "|", v.clampf(-1.5, 0.7), "|", v.limit_length(1.7), "|", v.normalized(), "|", v.dot(Vector3(2.5, 3.5, -0.5)), "|", v.cross(Vector3(2.5, 3.5, -0.5)), "|", v.angle_to(Vector3(2.5, 3.5, -0.5)), "|", v.slerp(Vector3(1, -1, 2), 0.3))
		print("V3C|", v.cubic_interpolate(Vector3(0.3, -0.7, 2.5), Vector3(2.5, 2.5, -1.5), Vector3(-1.5, 4.5, 0.125), 0.3), "|", v.bezier_interpolate(Vector3(0.3, -0.7, 2.5), Vector3(2.5, 2.5, -1.5), Vector3(-1.5, 4.5, 0.125), 0.3), "|", v.slide(Vector3(0.6, 0.8, 0)), "|", v.project(Vector3(2, 3, 0.5)), "|", v.bounce(Vector3(0.6, 0.8, 0)), "|", v.signed_angle_to(Vector3(2.5, 3.5, -0.5), Vector3(0, 0, 1)))
	for v in [Vector3i(3, -4, 5), Vector3i(-1, 1, 0), Vector3i(2147483647, -2147483648, 1), Vector3i(0, 0, 0)]:
		print("V3I|", v.sign(), "|", v.abs(), "|", v.min(Vector3i(2, -2, 2)), "|", v.snapped(Vector3i(0, 5, 5)), "|", v.length_squared(), "|", v.distance_to(Vector3i(7, 9, 11)), "|", v.clampi(-2, 2), "|", v.snappedi(5), "|", v.min_axis_index(), "|", v.max_axis_index())
	for c in [Color(pz, nz, 0.5, 1), Color(-0.2, 1.5, 0.0031308, 0.5), Color(NAN, 0.5, 0.5, 0.5), Color(INF, -INF, 0.25, 1), Color(1.0039, 0.49999, 0.5000001, 0.99999)]:
		print("C|", c.lightened(0.3), "|", c.darkened(0.3), "|", c.inverted(), "|", c.get_luminance(), "|", c.lerp(Color(0.2, 0.4, 0.6, 0.8), 0.3), "|", c.blend(Color(0.2, 0.4, 0.6, 0.3)), "|", c.to_html(), "|", c.to_html(false), "|", c.to_rgba32(), "|", c.is_equal_approx(Color(0.5, 0.5, 0.5, 0.5)))
	print("SNAPX|", Vector3i(2147483647, 2147483647, -2147483648).length_squared(), "|", Vector3i(2147483647, -2147483648, 1).distance_squared_to(Vector3i(-7, -9, -11)), "|", Vector2i(2147483647, -2147483648).distance_squared_to(Vector2i(-7, -9)))
	var b2 = Vector2(10000000.0, 20000001.5)
	print("EB2|", b2.bezier_interpolate(Vector2(0.3, -0.7), Vector2(2.5, 2.5), Vector2(-1.5, 4.5), 0.3), "|", b2.cubic_interpolate(Vector2(0.3, -0.7), Vector2(2.5, 2.5), Vector2(-1.5, 4.5), 0.3))
	print("EO2|", b2.limit_length(1.7), "|", b2.normalized(), "|", b2.angle_to(Vector2(1.0, -1.0)), "|", b2.distance_to(Vector2(-3.0, 5.5)), "|", b2.length(), "|", b2.length_squared())
	var b3 = Vector3(10000000.0, 20000001.5, -3000000.25)
	print("EB3|", b3.bezier_interpolate(Vector3(0.3, -0.7, 2.5), Vector3(2.5, 2.5, -1.5), Vector3(-1.5, 4.5, 0.125), 0.3), "|", b3.cubic_interpolate(Vector3(0.3, -0.7, 2.5), Vector3(2.5, 2.5, -1.5), Vector3(-1.5, 4.5, 0.125), 0.3))
	print("EO3|", b3.project(Vector3(2.0, 3.0, 0.5)), "|", b3.slide(Vector3(0.6, 0.8, 0.0)), "|", b3.bounce(Vector3(0.6, 0.8, 0.0)), "|", b3.length(), "|", b3.length_squared(), "|", b3.distance_to(Vector3(-3.0, 5.5, 7.0)))
	quit()
