extends SceneTree

func _initialize():
	var s := {"f": abs}
	print("a|", JSON.stringify(s))
	quit()
