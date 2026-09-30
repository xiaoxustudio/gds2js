extends SceneTree

class A extends RefCounted:
	func p_int(a: int) -> String:
		return "int<-%s(%s)" % [str(a), typeof(a)]

	func p_float(a: float) -> String:
		return "float<-%s(%s)" % [str(a), typeof(a)]

	func p_bool(a: bool) -> String:
		return "bool<-%s(%s)" % [str(a), typeof(a)]

	func p_str(a: String) -> String:
		return "str<-%s(%s)" % [a, typeof(a)]

	func p_vec2(a: Vector2) -> String:
		return "vec2<-%s(%s)" % [str(a), typeof(a)]

	func p_vec2i(a: Vector2i) -> String:
		return "vec2i<-%s(%s)" % [str(a), typeof(a)]

	func p_color(a: Color) -> String:
		return "color<-%s(%s)" % [str(a), typeof(a)]

	func math(a: int) -> String:
		return "math<-%s|%s" % [str(a), str(a * 2)]

func _initialize():
	var x = A.new()
	var f: float = 2.7
	var big: float = 1e30
	var sn := &"nm"
	var vi := Vector2i(3, 4)
	var v := Vector2(1.7, 2.2)
	print("t1 ", x.p_int(7), " ", x.p_int(f), " ", x.p_int(true), " ", x.p_int(false))
	print("t2 ", x.p_int(big))
	print("t3 ", x.p_float(1), " ", x.p_float(2.5), " ", x.p_float(true))
	print("t4 ", x.p_bool(3), " ", x.p_bool(0), " ", x.p_bool(2.7))
	print("t5 ", x.p_str("abc"), " ", x.p_str(sn))
	print("t6 ", x.p_vec2(vi), " ", x.p_vec2(Vector2(1, 2)))
	print("t7 ", x.p_vec2i(v), " ", x.p_vec2i(Vector2i(5, 6)))
	print("t8 ", x.p_color("abc"), " ", x.p_color(Color(0.25, 0.5, 0.75, 1)))
	print("t9 ", x.math(2.7), " ", x.math(true))
	quit()
