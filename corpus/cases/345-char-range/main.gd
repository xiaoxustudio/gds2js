extends SceneTree

func _initialize():
	print(char(-1))
	print(char(4294967296))
	print(char(9223372036854775807))
	print(char(-4294967296))
	print(char("a"))
	quit()
