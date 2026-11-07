extends SceneTree

func f() -> int:
	return "x"

func _initialize():
	print(f())
	quit()
