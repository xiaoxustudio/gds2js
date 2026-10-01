extends SceneTree

func _initialize():
	print("r1 ", typeof(PI), " ", PI, " ", TAU)
	print("r2 ", typeof(INF), " ", INF, " ", NAN)
	print("r3 ", PI == 3.141592653589793, " ", PI == 3.14159265358979)
	print("r4 ", TAU == PI * 2.0, " ", INF > 1e308, " ", NAN == NAN)
	print("r5 ", [PI, TAU, INF, NAN])
	print("r6 ", -PI, " ", -INF, " ", INF - INF, " ", 1.0 / INF)
	var a: int = PI
	var b: int = TAU
	print("r7 ", a, " ", b)
	var p := PI
	print("r8 ", typeof(p), " ", p / 2.0)
	quit()
