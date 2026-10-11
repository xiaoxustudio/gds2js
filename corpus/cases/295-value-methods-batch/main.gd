extends SceneTree

func _initialize():
	for v in [Vector2(1.5, -2.5), Vector2(-4, -4), Vector2(0, 0.5), Vector2(3, -3)]:
		print("V2|", v.min(Vector2(1, -1)), "|", v.max(Vector2(1, -1)), "|", v.minf(0.5), "|", v.maxf(0.5), "|", v.clamp(Vector2(-1, 2), Vector2(3, 4)), "|", v.clampf(-2.0, 1.0), "|", v.snappedf(0.5), "|", v.posmod(2.0), "|", v.posmodv(Vector2(2, -3)))
	for v in [Vector2(1.5, -2.5), Vector2(-4, 4)]:
		print("V2X|", v.clamp(Vector2(3, 4), Vector2(-1, -2)), "|", v.clampf(2.0, -2.0), "|", v.posmod(-2.0), "|", v.posmod(0.0), "|", v.snappedf(0.0), "|", v.snappedf(-0.5))
	for v in [Vector2i(3, -4), Vector2i(-1, 1), Vector2i(2147483647, -2147483648)]:
		print("V2I|", v.mini(2), "|", v.maxi(2), "|", v.clampi(-2, 2), "|", v.snappedi(5), "|", v.clampi(2, -2), "|", v.snappedi(0))
	for v in [Vector3(1.5, -2.5, 3.0), Vector3(0, 0, 0), Vector3(-4, 8, -16)]:
		print("V3|", v.minf(1.0), "|", v.maxf(1.0), "|", v.posmod(3.0), "|", v.posmodv(Vector3(3, -3, 2)))
	for v in [Vector3(1.5, -2.5, 3.0), Vector3(0, 1, 0)]:
		print("V3X|", v.posmod(-3.0), "|", v.posmod(0.0), "|", v.minf(-0.0), "|", v.maxf(-0.0))
	for v in [Vector3i(3, -4, 5), Vector3i(-1, 1, 0), Vector3i(2147483647, 0, -214847)]:
		print("V3I|", v.mini(2), "|", v.maxi(2), "|", v.clampi(-2, 2), "|", v.snappedi(5), "|", v.clampi(2, -2), "|", v.snappedi(0))
	for c in [Color(0.25, 0.5, 0.75, 1), Color(-0.2, 1.5, 0.04045, 0.0031308), Color(0, 0, 0, 0), Color(1, 1, 1, 1)]:
		print("C|", c.clamp(), "|", c.clamp(Color(0.2, 0.2, 0.2, 0.2)), "|", c.clamp(Color(0.2, 0.6, 0.1, 0), Color(0.4, 0.9, 0.3, 1)), "|", c.linear_to_srgb(), "|", c.srgb_to_linear())
	print("CX|", Color(0.5, 0.5, 0.5, 0.5).clamp(Color(0.9, 0.1, 0.9, 0.1), Color(0.1, 0.9, 0.1, 0.9)))
	print("CLX|", Vector2i(3, -4).clamp(Vector2i(2, -2), Vector2i(-2, 2)), "|", Vector2i(-1, 5).clamp(Vector2i(2, -2), Vector2i(-2, 2)))
	print("CLY|", Vector3i(3, -4, 5).clamp(Vector3i(2, -2, 2), Vector3i(-2, 2, -2)), "|", Vector3(3, -4, 5).clamp(Vector3(2, -2, 2), Vector3(-2, 2, -2)), "|", Vector3(3, -4, 5).clampf(2.0, -2.0))
	print("CLZ|", Color(3, -3, 0.5, 1).clamp(Color(2, 2, 2, 2), Color(-2, -2, -2, -2)), "|", Color(3, -3, 0.5, 1).clamp())
	print("SNAP|", Vector2i(2147483647, -2147483648).snapped(Vector2i(5, 5)), "|", Vector2i(-2147483648, 7).snappedi(5), "|", Vector3i(-2147483648, 2147483647, 3).snapped(Vector3i(5, 5, 5)), "|", Vector3i(-2147483648, 2, -1).snappedi(5))
	print("SNAP2|", Vector2i(-5, 5).snappedi(2), "|", Vector2i(-5, 5).snapped(Vector2i(2, 2)), "|", Vector2i(-15, 25).snappedi(10), "|", Vector2i(0, -0).snappedi(3))
	quit()
