extends SceneTree

func _initialize():
	match 0.0:
		linear_to_db(1.0):
			print("l2db|arm")
		_:
			print("l2db|default")
	match 1.0:
		ease(1.0, 0.5):
			print("ease|arm")
		_:
			print("ease|default")
	match 0.0:
		bezier_interpolate(0.0, 1.0, 2.0, 3.0, 0.0):
			print("bezier|arm")
		_:
			print("bezier|default")
	match 0.0:
		cubic_interpolate(0.0, 1.0, 2.0, 3.0, 0.0):
			print("cubic|arm")
		_:
			print("cubic|default")
	match 0.0:
		cubic_interpolate_angle(0.0, 90.0, 180.0, 270.0, 0.0):
			print("cubica|arm")
		_:
			print("cubica|default")
	match 1.0:
		float("1"):
			print("float|arm")
		_:
			print("float|default")
	match 2.5:
		fmod(5.5, 3.0):
			print("fmod|arm")
		_:
			print("fmod|default")
	match 2.0:
		ceilf(1.2):
			print("ceilf|arm")
		_:
			print("ceilf|default")
	match 1:
		floori(1.7):
			print("floori|arm")
		_:
			print("floori|default")
	match 2:
		ceili(1.2):
			print("ceili|arm")
		_:
			print("ceili|default")
	quit()
