extends SceneTree

func _initialize():
	var p = PackedStringArray(["a", "b"])
	print("r ", p.join("-"))
	quit()
