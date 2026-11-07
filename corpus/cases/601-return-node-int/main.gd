extends SceneTree

func f() -> Node:
	return 1

func _initialize():
	print(f())
	quit()
