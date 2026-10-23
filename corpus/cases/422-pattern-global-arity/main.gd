extends SceneTree

func _initialize():
	match 1:
		wrap(3, 2):
			print("arm")
		_:
			print("default")
	quit()
