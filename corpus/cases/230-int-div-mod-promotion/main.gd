extends SceneTree

func d(a, b):
	return str(a / b) + ":" + str(typeof(a / b))

func m(a, b):
	return str(a % b) + ":" + str(typeof(a % b))

func _initialize():
	print("div\t" + d(7, 2) + "\t" + d(-7, 2) + "\t" + d(7, -2) + "\t" + d(-7, -2))
	print("div-mixed\t" + d(7, 2.0) + "\t" + d(7.0, 2) + "\t" + d(7.5, 2.0))
	print("div-lit\t" + str(7 / 3) + "\t" + str(7 / 2.0) + "\t" + str(7.0 / 2))
	print("mod\t" + m(7, 3) + "\t" + m(-7, 3) + "\t" + m(7, -3) + "\t" + m(-7, -3))
	print("mod-zero-guard\t" + m(7, 3) + "\t" + m(0, 5))
	print("int64\t" + str(1 << 62) + "\t" + str((1 << 62) * 3) + "\t" + str((1 << 62) / 3))
	print("shift\t" + str(1 << 40) + "\t" + str((1 << 40) >> 40) + "\t" + str(8 >> 1))
	print("bitops\t" + str(6 & 9) + "\t" + str(6 | 9) + "\t" + str(6 ^ 9) + "\t" + str(~5))
	print("pow\t" + str(2 ** 10) + "\t" + str(2 ** 0) + "\t" + str((-2) ** 3) + "\t" + str(2.0 ** 10))
	print("assign-ops\t" + _compound())
	quit()

func _compound() -> String:
	var v = 7
	v /= 2
	var w = 7
	w %= 3
	var x = 1
	x <<= 8
	var y = 256
	y >>= 4
	var z = 2
	z **= 5
	return str(v) + "/" + str(typeof(v)) + " " + str(w) + " " + str(x) + " " + str(y) + " " + str(z)
