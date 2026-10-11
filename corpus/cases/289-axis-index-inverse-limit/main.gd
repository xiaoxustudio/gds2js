extends SceneTree

func _initialize():
	for v in [Vector2(1.5, 2.5), Vector2(2.5, 1.5), Vector2(2, 2), Vector2(-3, 1), Vector2(-1, -3), Vector2(0, 0), Vector2(INF, 2), Vector2(NAN, 2), Vector2(2, NAN)]:
		print("V2|", v.max_axis_index(), "|", v.min_axis_index(), "|", typeof(v.max_axis_index()))
	for v in [Vector2i(3, 4), Vector2i(4, 3), Vector2i(2, 2), Vector2i(-3, 1), Vector2i(-1, -3), Vector2i(0, 0)]:
		print("V2I|", v.max_axis_index(), "|", v.min_axis_index())
	for v in [Vector3(1, 2, 3), Vector3(3, 2, 1), Vector3(2, 2, 2), Vector3(0, 0, 0), Vector3(-5, 1, 2), Vector3(INF, 0, 0), Vector3(NAN, 0, 1)]:
		print("V3|", v.max_axis_index(), "|", v.min_axis_index(), "|", v.inverse())
	for v in [Vector3i(3, 4, 5), Vector3i(5, 4, 3), Vector3i(4, 4, 4), Vector3i(-1, -9, -5), Vector3i(0, 0, 0)]:
		print("V3I|", v.max_axis_index(), "|", v.min_axis_index())
	for v in [Vector2(3, 4), Vector2(0.5, 0.5), Vector2(0, 0), Vector2(-3, -4)]:
		print("LL2|", v.limit_length(), "|", v.limit_length(2.0), "|", v.limit_length(0.0), "|", v.limit_length(-1.0))
	for v in [Vector3(1, 2, 3), Vector3(0, 0, 0)]:
		print("LL3|", v.limit_length(), "|", v.limit_length(2.0), "|", v.limit_length(0.0), "|", v.limit_length(-1.0))
	for v in [Vector2(0.000005, 0.0), Vector2(0.00002, 0.0), Vector3(0.000005, 0.0, 0.0), Vector3(0.00002, 0.0, 0.0)]:
		print("LLS|", v.limit_length(0.0), "|", v.limit_length(1.0))
	quit()
