extends SceneTree

func _initialize():
	var b = PackedByteArray([1, 2, 3])
	var s = b.sort()
	print("t ", s)
	quit()
