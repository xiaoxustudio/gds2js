extends SceneTree

func _initialize():
	var d: Dictionary[int, String] = {1: "a"}
	print(d["k"])
	quit()
