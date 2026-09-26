extends SceneTree

func _initialize():
	# is_equal_approx：逐分量 |a-b| < max(1e-5, 1e-5*|a|)
	print(Vector2(1, 2).is_equal_approx(Vector2(1.0000095, 2)), " ", Vector2(1, 2).is_equal_approx(Vector2(1.00001, 2)))
	print(Vector2(3, 4).is_equal_approx(Vector2(3.000029, 4)), " ", Vector2(3, 4).is_equal_approx(Vector2(3.000031, 4)))
	print(Vector2(0.001, 0).is_equal_approx(Vector2(0.0010002, 0)), " ", Vector2(1e300, 1).is_equal_approx(Vector2(1e300, 1)))
	print(Vector3(1, 2, 3).is_equal_approx(Vector3(1.0000095, 2, 3)), " ", Vector3(1, 2, 3).is_equal_approx(Vector3(1.00001, 2, 3)))
	print(Vector3(3, 4, 5).is_equal_approx(Vector3(3.000029, 4, 5)), " ", Vector3(0.001, 0, 0).is_equal_approx(Vector3(0.0010002, 0, 0)))
	# is_zero_approx：逐分量 |v| < 1e-5
	print(Vector2(0, 0).is_zero_approx(), " ", Vector2(0.000009, 0).is_zero_approx(), " ", Vector2(0.00001, 0).is_zero_approx(), " ", Vector2(0, -0.000009).is_zero_approx())
	print(Vector3(0, 0, 0).is_zero_approx(), " ", Vector3(0.000009, 0, 0).is_zero_approx(), " ", Vector3(0.00001, 0, 0).is_zero_approx(), " ", Vector3(0, 0, -0.00002).is_zero_approx())
	# is_normalized：|length_squared() - 1| < 1e-3
	print(Vector2(0.9995, 0).is_normalized(), " ", Vector2(0.9992, 0).is_normalized(), " ", Vector2(1.0008, 0).is_normalized(), " ", Vector2(1, 0.045).is_normalized())
	print(Vector2(0.7071, 0.7071).is_normalized(), " ", Vector2(0.9999, 0.9999).is_normalized(), " ", Vector2(0, 0).is_normalized())
	print(Vector3(0.9995, 0, 0).is_normalized(), " ", Vector3(0.9992, 0, 0).is_normalized(), " ", Vector3(0.5774, 0.5774, 0.5774).is_normalized(), " ", Vector3(1, 1, 0.045).is_normalized())
	# clampf 与 clamp 同值
	print(Vector3(1, 2, 3).clampf(1.5, 2.5), " | ", Vector3(1, 2, 3).clamp(Vector3(1.5, 1.5, 1.5), Vector3(2.5, 2.5, 2.5)))
	print(Vector3(3, 2, 1).clampf(1.5, 2.5), " | ", Vector3(-1, 2, 5).clampf(0, 1))
	# slerp（Vector2 极坐标 / Vector3 对称 sin 权重，退化退回 lerp）
	print(Vector2(1, 0).slerp(Vector2(0, 1), 0.5), " | ", Vector2(2, 0).slerp(Vector2(0, 3), 0.25))
	print(Vector2(1, 2).slerp(Vector2(0, -1), 0.5), " | ", Vector2(1, 0).slerp(Vector2(-1, 0), 0.5))
	print(Vector2(1, 2).slerp(Vector2(-1, -2), 0.5), " | ", Vector2(5, 1).slerp(Vector2(-2, 3), 0.7))
	print(Vector2(0, 0).slerp(Vector2(1, 0), 0.5), " | ", Vector2(1, 0).slerp(Vector2(0, 0), 0.5), " | ", Vector2(0, 0).slerp(Vector2(0, 0), 0.5))
	print(Vector2(1, 2).slerp(Vector2(1, 2), 0.5), " | ", Vector2(3, 4).slerp(Vector2(3, 4), 0.3), " | ", Vector2(0.5, 0.5).slerp(Vector2(0, 1), 0.25))
	print(Vector2(3, 4).slerp(Vector2(1, 2), 0.5), " | ", Vector2(3, 4).slerp(Vector2(1, 2), 0.0), " | ", Vector2(3, 4).slerp(Vector2(1, 2), 1.0))
	print(Vector3(1, 0, 0).slerp(Vector3(0, 1, 0), 0.5), " | ", Vector3(2, 0, 0).slerp(Vector3(0, 3, 0), 0.25))
	print(Vector3(1, 2, 3).slerp(Vector3(0, 1, 0), 0.25), " | ", Vector3(1, 2, 3).slerp(Vector3(0, 1, 0), 0.75))
	print(Vector3(1, 2, 3).slerp(Vector3(4, 5, 6), 0.3), " | ", Vector3(1, 1, 0).slerp(Vector3(0, 1, 1), 0.5))
	print(Vector3(1, 2, 3).slerp(Vector3(-1, -2, -3), 0.5), " | ", Vector3(0, 0, 0).slerp(Vector3(1, 0, 0), 0.5), " | ", Vector3(1, 0, 0).slerp(Vector3(0, 0, 0), 0.5))
	print(Vector3(0.5, 0.5, 0).slerp(Vector3(0, 1, 0), 0.25), " | ", Vector3(3, 4, 0).slerp(Vector3(0, 5, 0), 0.5))
	quit()
