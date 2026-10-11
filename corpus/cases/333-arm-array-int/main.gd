extends SceneTree

func g(p):
	match p:
		Array(1):
			print(1)
		_:
			print(2)
	quit()
