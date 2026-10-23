extends SceneTree

func _init():
	match 1:
		1 when true else 2:
			print("a")
		_:
			print("d")
	quit()
