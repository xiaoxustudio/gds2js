extends SceneTree

func _initialize():
	print("a|", JSON.stringify([PackedStringArray(["a", "b"])]), "|", JSON.stringify(PackedByteArray([1, 2])))
	print("b|", JSON.stringify([[]]), "|", JSON.stringify([{}]))
	quit()
