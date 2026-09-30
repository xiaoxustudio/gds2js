extends SceneTree

signal fired(a)

func _initialize():
	var v = fired.is_valid()
	print("r ", v)
	quit()
