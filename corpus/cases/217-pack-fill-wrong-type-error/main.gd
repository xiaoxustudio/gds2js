extends SceneTree

func _initialize():
	var p = PackedStringArray(["a", "b"])
	p.fill(7)
	print("r ", p)
	quit()
