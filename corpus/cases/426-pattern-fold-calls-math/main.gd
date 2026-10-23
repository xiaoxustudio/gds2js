extends SceneTree

func _initialize():
	match 8.0:
		pow(2, 3):
			print("pow|arm")
		_:
			print("pow|default")
	match 1.0:
		exp(0):
			print("exp|arm")
		_:
			print("exp|default")
	match 0.0:
		log(1):
			print("log|arm")
		_:
			print("log|default")
	match 0.0:
		sin(0):
			print("sin|arm")
		_:
			print("sin|default")
	match 1.0:
		cos(0):
			print("cos|arm")
		_:
			print("cos|default")
	match 0.0:
		tan(0):
			print("tan|arm")
		_:
			print("tan|default")
	match 0.0:
		sinh(0):
			print("sinh|arm")
		_:
			print("sinh|default")
	match 1.0:
		cosh(0):
			print("cosh|arm")
		_:
			print("cosh|default")
	match 0.0:
		tanh(0):
			print("tanh|arm")
		_:
			print("tanh|default")
	match 0.0:
		asin(0):
			print("asin|arm")
		_:
			print("asin|default")
	match 0.0:
		acos(1):
			print("acos|arm")
		_:
			print("acos|default")
	match 0.0:
		atan(0):
			print("atan|arm")
		_:
			print("atan|default")
	match 0.0:
		atan2(0, 1):
			print("atan2|arm")
		_:
			print("atan2|default")
	match 0.0:
		rad_to_deg(0):
			print("rtd|arm")
		_:
			print("rtd|default")
	match 1.0:
		floor(1.7):
			print("floor|arm")
		_:
			print("floor|default")
	match 2.0:
		ceil(1.2):
			print("ceil|arm")
		_:
			print("ceil|default")
	match 2.0:
		round(1.5):
			print("round|arm")
		_:
			print("round|default")
	match 2.0:
		roundf(1.5):
			print("roundf|arm")
		_:
			print("roundf|default")
	match 2.5:
		fposmod(5.5, 3.0):
			print("fposmod|arm")
		_:
			print("fposmod|default")
	match 1.0:
		lerp(0, 2, 0.5):
			print("lerp|arm")
		_:
			print("lerp|default")
	match 1:
		min(1, 2):
			print("min|arm")
		_:
			print("min|default")
	match 2:
		maxi(1, 2):
			print("maxi|arm")
		_:
			print("maxi|default")
	match 0.5:
		lerp_angle(0.0, 1.0, 0.5):
			print("lerpa|arm")
		_:
			print("lerpa|default")
	match 0.5:
		smoothstep(0.0, 1.0, 0.5):
			print("smooth|arm")
		_:
			print("smooth|default")
	match 3.0:
		snappedf(2.5, 1.0):
			print("snappedf|arm")
		_:
			print("snappedf|default")
	match 3:
		snappedi(2.5, 1):
			print("snappedi|arm")
		_:
			print("snappedi|default")
	match 1:
		wrap(5, 1, 3):
			print("wrap|arm")
		_:
			print("wrap|default")
	match 1:
		wrapi(5, 1, 3):
			print("wrapi|arm")
		_:
			print("wrapi|default")
	match 1.5:
		wrapf(5.5, 1.0, 3.0):
			print("wrapf|arm")
		_:
			print("wrapf|default")
	match true:
		is_equal_approx(1.0, 1.0):
			print("iea|arm")
		_:
			print("iea|default")
	match true:
		is_finite(1.0):
			print("ifin|arm")
		_:
			print("ifin|default")
	match false:
		is_nan(1.0):
			print("inan|arm")
		_:
			print("inan|default")
	match 0.5:
		inverse_lerp(0.0, 2.0, 1.0):
			print("invlerp|arm")
		_:
			print("invlerp|default")
	quit()
