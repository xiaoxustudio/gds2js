extends SceneTree

func _initialize():
	var b = PackedByteArray([1, 2])
	b.append("x")
	quit()
