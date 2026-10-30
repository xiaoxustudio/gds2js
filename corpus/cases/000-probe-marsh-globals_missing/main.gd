extends SceneTree

func _initialize():
	print("a|", Marshalls.range_to_bytes(5))
	quit()
