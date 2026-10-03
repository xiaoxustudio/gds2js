extends SceneTree

func _initialize():
	match [3, 1]:
		[a, b] when a > b:
			print("desc")
		_:
			print("other")
	quit()
