extends SceneTree

class Inner extends RefCounted:
	func v():
		return abs

	static func sv():
		return len

func _initialize():
	print("abs => ", typeof(abs), "|", abs)
	print("str => ", typeof(str), "|", str)
	print("len => ", typeof(len), "|", len)
	print("range => ", typeof(range), "|", range)
	print("convert => ", typeof(convert), "|", convert)
	print("type_convert => ", typeof(type_convert), "|", type_convert)
	print("load => ", typeof(load), "|", load)
	print("prints => ", typeof(prints), "|", prints)
	print("push_warning => ", typeof(push_warning), "|", push_warning)
	print("randi => ", typeof(randi), "|", randi)
	print("seed => ", typeof(seed), "|", seed)
	print("weakref => ", typeof(weakref), "|", weakref)
	print("get_stack => ", typeof(get_stack), "|", get_stack)
	print("wrapi => ", typeof(wrapi), "|", wrapi)
	print("var_to_str => ", typeof(var_to_str), "|", var_to_str)
	print("fmt|", "%s" % abs)
	print("eq|", abs == abs, "|", abs == sign, "|", str_to_var == str_to_var, "|", abs == Callable(), "|", len == load)
	var f = abs
	print("eqvar|", typeof(f), "|", f, "|", f == abs, "|", f == sign)
	print("face|", abs.is_valid(), "|", abs.is_null(), "|", typeof(abs.get_method()), "|", abs.get_method())
	print("face2|", abs.get_argument_count(), "|", max.get_argument_count(), "|", lerp.get_argument_count(), "|", range.get_argument_count(), "|", prints.get_argument_count())
	print("face3|", abs.get_bound_arguments_count(), "|", abs.bind(1, 2).get_bound_arguments_count(), "|", abs.bind(1, 2).get_bound_arguments())
	print("face4|", abs.bind().get_method(), "|", abs.bind() == abs, "|", abs.bind(1) == abs.bind(2))
	print("call-abs|", typeof(abs.call(-3)), "|", abs.call(-3))
	print("call-minmax|", max.call(2, 7), "|", min.call(2, 7), "|", maxi.call(2, 7), "|", mini.call(2, 7), "|", maxf.call(2, 7))
	print("call-str|", typeof(str.call(1, 2, 3)), "|", str.call(1, 2, 3), "|", str.call(5))
	print("call-len|", len.call("abcd"), "|", len.call([1, 2]))
	print("call-range|", typeof(range.call(3)), "|", range.call(3), "|", range.call(1, 5), "|", range.call(1, 2, 3), "|", range.call(-2))
	print("call-convert|", convert.call("7", TYPE_INT), "|", type_convert.call("7", TYPE_INT))
	print("call-vts|", var_to_str.call([1, 2]), "|", str_to_var.call("[1,2]"))
	print("call-hash|", hash.call(7))
	print("call-sign|", sign.call(-9), "|", signf.call(-9), "|", signi.call(-9.5))
	print("call-pow|", sqrt.call(9.0), "|", pow.call(2, 10), "|", exp.call(0.0), "|", log.call(1.0))
	print("call-round|", floor.call(3.7), "|", ceil.call(3.2), "|", round.call(3.5), "|", floorf.call(3.7), "|", ceili.call(3.2), "|", roundi.call(2.5))
	print("call-clamp|", clamp.call(5, 1, 3), "|", clampi.call(5, 1, 3), "|", clampf.call(5, 1, 3))
	print("call-wrap|", wrapi.call(5, 0, 3), "|", wrapf.call(5.0, 0.0, 3.0))
	print("call-mod|", posmod.call(-7, 3), "|", fmod.call(7, 2.5), "|", fposmod.call(-7, 3))
	print("call-mix|", lerp.call(1.0, 2.0, 0.5), "|", lerpf.call(1.0, 2.0, 0.5), "|", inverse_lerp.call(0.0, 10.0, 2.5))
	print("call-geom|", move_toward.call(1.0, 5.0, 2.0), "|", snapped.call(1.2, 0.5), "|", snappedi.call(7, 5), "|", snappedf.call(1.2, 0.5))
	print("call-ang|", deg_to_rad.call(180.0), "|", rad_to_deg.call(PI), "|", angle_difference.call(0.0, PI))
	print("call-cmp|", is_equal_approx.call(1.0, 1.0), "|", is_zero_approx.call(0.0), "|", is_nan.call(NAN), "|", is_inf.call(INF), "|", is_finite.call(1.0))
	print("call-adv|", ease.call(0.5, 2.0), "|", smoothstep.call(0.0, 1.0, 0.5), "|", remap.call(5.0, 0.0, 10.0, 0.0, 2.0), "|", cubic_interpolate.call(1.0, 2.0, 1.0, 2.0, 0.5))
	print("call-typeof|", typeof.call(1), "|", typeof.call("a"))
	print("call-f|", f.call(-5), "|", f)
	print("callv|", abs.callv([-4]), "|", typeof(abs.callv([])), "|", abs.callv([]))
	print("callv2|", abs.callv([1, 2]), "|", max.callv([1, 7]))
	print("bind|", abs.bind().call(-8), "|", abs.bind(-9).callv([]))
	print("arr|", str([abs, len, prints]))
	print("arrhas|", [abs, sign].has(sign), "|", [abs, sign].has(len))
	print("dicthas|", {abs: 1}.has(abs), "|", {abs: 1}.has(sign))
	print("dictstr|", str({"a": abs}))
	print("vts|", var_to_str(abs), "|", var_to_str(Callable()))
	print("lamvts|", var_to_str(func (): return 1))
	print("inner|", typeof(Inner.new().v()), "|", Inner.new().v(), "|", Inner.new().v().call(-2))
	print("static|", Inner.sv(), "|", Inner.sv().call("abcd"))
	var lam = func (): return max
	print("lambda|", typeof(lam.call()), "|", lam.call(), "|", lam.call().call(3, 9))
	var len = 5
	print("shadow|", len, "|", typeof(len), "|", abs)
	var abs2 = 7
	print("shadow2|", abs2, "|", typeof(abs2), "|", str)
	var g = func (abs): return [abs, typeof(abs), sign]
	print("shadow3|", g.call(9))
	for sign in 3:
		print("shadow4|", sign)
	print("afterfor|", sign, "|", abs)
	quit()
