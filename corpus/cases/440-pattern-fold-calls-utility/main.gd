extends SceneTree

func _initialize():
	match 0.0:
		acosh(1):
			print("acosh|arm")
		_:
			print("acosh|def ", acosh(1))
	match 0.0:
		asinh(0):
			print("asinh|arm")
		_:
			print("asinh|def ", asinh(0))
	match 0.0:
		atanh(0):
			print("atanh|arm")
		_:
			print("atanh|def ", atanh(0))
	match 15.0:
		remap(1.0, 0.0, 2.0, 10.0, 20.0):
			print("remap|arm")
		_:
			print("remap|def ", remap(1.0, 0.0, 2.0, 10.0, 20.0))
	match 1.0:
		floorf(1.7):
			print("floorf|arm")
		_:
			print("floorf|def ", floorf(1.7))
	match 1:
		roundi(1.0):
			print("roundi|arm")
		_:
			print("roundi|def ", roundi(1.0))
	match 3:
		absi(-3):
			print("absi|arm")
		_:
			print("absi|def ", absi(-3))
	match -1.0:
		signf(-2.5):
			print("signf|arm")
		_:
			print("signf|def ", signf(-2.5))
	match false:
		is_inf(1.0):
			print("is_inf|arm")
		_:
			print("is_inf|def ", is_inf(1.0))
	match false:
		is_zero_approx(1.0):
			print("is_zero_approx|arm")
		_:
			print("is_zero_approx|def ", is_zero_approx(1.0))
	match 0:
		step_decimals(1.0):
			print("step_decimals|arm")
		_:
			print("step_decimals|def ", step_decimals(1.0))
	match 1.0:
		cubic_interpolate_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0):
			print("ccit|arm")
		_:
			print("ccit|def ", cubic_interpolate_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0))
	match 1.0:
		cubic_interpolate_angle_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0):
			print("ccait|arm")
		_:
			print("ccait|def ", cubic_interpolate_angle_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0))
	match 0.0:
		bezier_derivative(1.0, 1.0, 1.0, 1.0, 1.0):
			print("bezder|arm")
		_:
			print("bezder|def ", bezier_derivative(1.0, 1.0, 1.0, 1.0, 1.0))
	match 0.0:
		angle_difference(1.0, 1.0):
			print("angdiff|arm")
		_:
			print("angdiff|def ", angle_difference(1.0, 1.0))
	match 1.0:
		rotate_toward(1.0, 1.0, 1.0):
			print("rotw|arm")
		_:
			print("rotw|def ", rotate_toward(1.0, 1.0, 1.0))
	match 2:
		clamp(5, 0, 2):
			print("clamp|arm")
		_:
			print("clamp|def ", clamp(5, 0, 2))
	match 2.0:
		clampf(5.0, 0.0, 2.0):
			print("clampf|arm")
		_:
			print("clampf|def ", clampf(5.0, 0.0, 2.0))
	match 4:
		nearest_po2(4):
			print("po2|arm")
		_:
			print("po2|def ", nearest_po2(4))
	match 1.0:
		pingpong(1.0, 2.0):
			print("pp|arm")
		_:
			print("pp|def ", pingpong(1.0, 2.0))
	quit()
