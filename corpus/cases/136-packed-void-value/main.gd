extends SceneTree

func _initialize():
	var b: PackedByteArray = PackedByteArray([1, 2, 3])
	var r = b.reverse()
	print("t ", r)
	quit()
