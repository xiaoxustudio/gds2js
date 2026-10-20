extends SceneTree

class H:
	func m1():
		print("M1=", pingpong("a", 1.0, 2.0))
	func m2():
		print("M2=", sqrt([1], 2))
	func m3():
		print("M3=", move_toward(1.0))
	func m4():
		print("M4=", wrapf(1.0, 2.0, 3.0, [1]))
	func m5():
		print("M5=", bezier_derivative(1.0, 2.0, 3.0, [1]))
	func m6():
		print("M6=", remap([1], 2.0, 3.0))
	func m7():
		print("M7=", is_finite([1], 2.0))
	func m8():
		print("M8=", wrapi(1, "x"))
	func m9():
		print("M9=", db_to_linear([1], 2.0, 3.0))
	func m10():
		print("M10=", wrapf([1], 2.0))
	func m11():
		print("M11=", pingpong([1], 2.0, 3.0))

func _init():
	var h := H.new()
	h.m1(); h.m2(); h.m3(); h.m4(); h.m5(); h.m6(); h.m7(); h.m8(); h.m9(); h.m10(); h.m11()
	print("done")
	quit()
