extends SceneTree

func _initialize():
	match 3:
		abs(-3):
			print("abs|arm")
		_:
			print("abs|default")
	match 1:
		mini(1, 2):
			print("mini|arm")
		_:
			print("mini|default")
	match 2:
		max(1, 2):
			print("max|arm")
		_:
			print("max|default")
	match 0:
		sign(0):
			print("sign|arm")
		_:
			print("sign|default")
	match 2.0:
		sqrt(4):
			print("sqrt|arm")
		_:
			print("sqrt|default")
	match 0.0:
		deg_to_rad(0):
			print("deg|arm")
		_:
			print("deg|default")
	match 3:
		snapped(2.5, 1):
			print("snapped|arm")
		_:
			print("snapped|default")
	match 1:
		int("1"):
			print("int|arm")
		_:
			print("int|default")
	match 1:
		len("ab"):
			print("len|arm")
		_:
			print("len|default")
	quit()
