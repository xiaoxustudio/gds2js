extends SceneTree

const PI = 1

class Thing:
	const PIISH = PI

	static func sm():
		return TAU

func _initialize():
	print("r1 ", PI, " ", typeof(PI))
	print("r2 ", Thing.PIISH, " ", Thing.sm())
	print("r3 ", TAU, " ", typeof(TAU))
	quit()
