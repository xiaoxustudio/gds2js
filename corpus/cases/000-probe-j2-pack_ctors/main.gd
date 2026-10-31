extends SceneTree

func _initialize():
	print("a|", PackedInt16Array([1, 2]), "|", typeof(PackedInt16Array([1, 2])))
	var p: PackedInt16Array = [1, 2]
	print("b|", p)
	quit()
