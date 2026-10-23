extends SceneTree

func d(z):
	var z2 = 0
	return 100 / z2

func m(z):
	var z2 = 0
	return 100 % z2

func i(z) -> int:
	var z2 = 0
	return 100 / z2

func s(z) -> String:
	var z2 = 0
	return 100 / z2

func cascade(z):
	var v = d(z)
	return v + 1

func keep(z):
	var half = 100 / 4
	return half + z

func _initialize():
	print("A ", d(1))
	print("B ", m(1))
	print("C ", i(1))
	print("D [", s(1), "]")
	print("E ", cascade(1))
	print("F ", typeof(d(1)))
	print("G ", keep(3))
	quit()
