extends SceneTree

# 实测：bool 字面量在数值位上是**收**的（false 折成 0、true 折成 1）；逐位扫下来只有 max/min 的每一位与 wrap 的第一位拒 bool。
func _initialize():
	print("A|", absf(false), "|", absi(false), "|", sqrt(false), "|", acos(false))
	print("B|", angle_difference(false, 1.5), "|", atan2(false, 1.5), "|", posmod(false, 3), "|", posmod(5, false))
	print("C|", remap(false, 0, 1, 0, 1), "|", move_toward(false, 1, 0.5), "|", is_equal_approx(false, 0))
	print("D|", lerp(1, 2, false), "|", clamp(true, false, true), "|", max(1, 2))
	print("E|", clamp(false, false, true), "|", clamp(true, true, false), "|", clamp(false, true, true), "|", clamp(true, false, false), "|", clamp(false, true, false))
	quit()
