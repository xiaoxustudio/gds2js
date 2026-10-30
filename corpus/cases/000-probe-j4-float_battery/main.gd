extends SceneTree

func _initialize():
	var xs := [0.0, -0.0, 1.0, -1.0, 0.5, 1.0 / 3.0, 2.0 / 3.0, 1e15, 1e16, 1e19, 1e20, 1e21, 1e-5, 1e-6, 1e-7, 1e-20, 1.5e300, 3.4028234663852886e38, -1.5]
	print("a|", JSON.stringify(xs))
	print("b|", JSON.stringify(xs, "", true, true))
	print("c|", JSON.stringify(xs, "", false, false))
	quit()
