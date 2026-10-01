extends SceneTree

func _initialize():
	var v: String = "x"
	var p = PackedByteArray([1, 2])
	print("r ", p.append(v))
	quit()
