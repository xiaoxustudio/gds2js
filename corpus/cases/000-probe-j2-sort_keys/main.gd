extends SceneTree

func _initialize():
	var s := {}
	s["zeta"] = 1
	s["alpha"] = 2
	s["m"] = 3
	print("a|", JSON.stringify(s))
	print("b|", JSON.stringify(s, "", "", true))
	print("c|", JSON.stringify(s, "", "", false))
	quit()
