extends SceneTree

func _initialize():
	var p = PackedByteArray([1, 2])
	print("r ", p.has("a" + "b"))
	quit()
