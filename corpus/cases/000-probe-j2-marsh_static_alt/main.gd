extends SceneTree

func _initialize():
	print("a|", Marshalls.var_to_bytes(5))
	quit()
