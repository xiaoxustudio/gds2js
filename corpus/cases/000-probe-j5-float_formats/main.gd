extends SceneTree

func _initialize():
	var xs := [0.0, -0.0, 1.0, 1.0 / 3.0, 1e15, 1e20, 1.5e300, 1e-7, 3.4028234663852886e38]
	for v in xs:
		print("f|", str(v), "|", String.num(v), "|", String.num_scientific(v))
	print("g|", str(1.0 / 0.0), "|", String.num(1.0 / 0.0), "|", String.num_scientific(1.0 / 0.0))
	quit()
