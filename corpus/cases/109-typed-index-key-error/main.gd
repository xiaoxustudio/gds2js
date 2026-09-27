extends SceneTree

func _initialize():
	var d: Dictionary[int, String] = {1: "a"}
	d["s"] = "x"
	print(d)
	quit()
