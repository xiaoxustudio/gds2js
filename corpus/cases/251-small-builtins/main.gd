extends SceneTree

func row(tag: String, x: Variant) -> void:
	print(tag, "|", x, "|", typeof(x))

func _initialize():
	row("z01", absf(-3))
	row("z02", absf(-3.5))
	row("z03", absf(0))
	row("z04", absf(-0.0))
	row("z05", absf(true))
	row("z06", absf(-4611686018427387903))
	row("z07", absf(-INF))
	row("z08", absi(3.7))
	row("z09", absi(-3.7))
	row("z10", absi(false))
	row("z11", absi(-1))
	row("z12", absi(-4611686018427387903))
	row("z13", absi(-2147483648))
	row("z14", absi(2147483648))
	var imin := -9223372036854775807 - 1
	row("z15", imin)
	row("z16", absi(imin))
	row("z17", abs(imin))
	row("z18", absf(imin))
	row("z19", wrap(3.5, 0.0, 2.0))
	row("z20", wrap(3, 0, 2))
	row("z21", wrap(3.5, 0, 2))
	row("z22", wrap(-1, 0, 3))
	row("z23", wrap(1.5, 0.0, 1.0))
	row("z24", wrap(7, 0, -5))
	row("z25", wrap(-1, -3, 0))
	row("z26", wrapf(1.5, -3.0, 0.0))
	print("z27|", is_same(1, 1), "|", is_same(1, 1.0), "|", is_same(1, true))
	var arr = [1]
	var arr2 = [1]
	print("z28|", is_same(arr, arr), "|", is_same(arr, arr2), "|", arr == arr2)
	print("z29|", is_same("a", "a"), "|", is_same(&"a", &"a"), "|", is_same(null, null))
	print("z30|", is_same(0.0, -0.0), "|", is_same(INF, INF), "|", is_same(NAN, NAN))
	print("z31|", is_same(Vector2(1, 2), Vector2(1, 2)), "|", is_same(3.0, 3), "|", is_same(0, -0.0))
	var f = abs
	print("z32|", is_same(f, abs), "|", is_same(abs, abs), "|", is_same(str_to_var, str_to_var))
	quit()
