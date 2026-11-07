extends SceneTree

func f() -> Vector2:
	return "x"

func _initialize():
	print(f())
	quit()
