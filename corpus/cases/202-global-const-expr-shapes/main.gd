extends SceneTree

const TWO_PI = PI * 2.0

func _initialize():
	var d = {PI: 1, INF: 2, NAN: 3}
	print("r1 ", d.size(), " ", d[PI])
	print("r2 ", TWO_PI, " ", typeof(TWO_PI))
	var arr: Array[float] = [PI, TAU]
	print("r3 ", arr, " ", arr.size())
	print("r4 ", "pi=" + str(PI), " ", PI < 3.2)
	quit()
