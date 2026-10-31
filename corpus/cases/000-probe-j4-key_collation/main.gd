extends SceneTree

func _initialize():
	var s := {}
	s["Z"] = 1
	s["a"] = 2
	s["A"] = 3
	s["é"] = 4
	s["10"] = 5
	s["2"] = 6
	s[""] = 7
	print("a|", JSON.stringify(s))
	quit()
