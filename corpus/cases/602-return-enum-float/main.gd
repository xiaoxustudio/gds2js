extends SceneTree

func f() -> Error:
	return 1.5

func _initialize():
	print(f())
	quit()
