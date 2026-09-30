extends SceneTree

signal fired(a)

func _initialize():
	var e = fired.emit(1)
	print("r ", e)
	quit()
