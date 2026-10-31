extends SceneTree

func _initialize():
	var d := {}
	d["zeta"] = 1
	d["alpha"] = 2
	d["m"] = 3
	print("a|", JSON.stringify(d))
	print("b|", JSON.stringify(d, "", "", true, true))
	quit()
