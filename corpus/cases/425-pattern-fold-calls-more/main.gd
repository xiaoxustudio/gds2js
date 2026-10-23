extends SceneTree

func _initialize():
	match 2.5:
		absf(-2.5):
			print("absf|arm")
		_:
			print("absf|default")
	match 1.0:
		lerpf(0.0, 2.0, 0.5):
			print("lerpf|arm")
		_:
			print("lerpf|default")
	match 2:
		posmod(5, 3):
			print("posmod|arm")
		_:
			print("posmod|default")
	match 2.0:
		move_toward(0.0, 2.0, 5.0):
			print("move|arm")
		_:
			print("move|default")
	match 2.0:
		maxf(1.0, 2.0):
			print("maxf|arm")
		_:
			print("maxf|default")
	match 1.0:
		minf(1.0, 2.0):
			print("minf|arm")
		_:
			print("minf|default")
	match 2:
		clampi(5, 0, 2):
			print("clampi|arm")
		_:
			print("clampi|default")
	match -1:
		signi(-9):
			print("signi|arm")
		_:
			print("signi|default")
	quit()
