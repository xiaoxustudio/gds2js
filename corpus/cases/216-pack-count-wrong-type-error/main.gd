extends SceneTree

func _initialize():
	var p = PackedVector2Array([Vector2(1, 2)])
	print("r ", p.count(7))
	quit()
