extends SceneTree

func g(p):
	match p:
		NodePath("a/b", "c"):
			print(1)
		_:
			print(2)
	quit()
