extends SceneTree

func g(p):
	match p:
		Vector2(1):
			print(1)
		_:
			print(2)
	quit()
