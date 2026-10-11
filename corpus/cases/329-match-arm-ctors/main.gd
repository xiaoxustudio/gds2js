extends SceneTree

func cls(s):
	match s:
		Vector2(1, 2):
			print("C|vec2-eq")
		Vector2():
			print("C|vec2-zero")
		_:
			print("C|vec2-none")

func nums(s):
	match s:
		Color(1, 2, 3):
			print("C|color-123")
		Color("ff0000"):
			print("C|color-hex")
		Color():
			print("C|color-zero")
		_:
			print("C|color-none")

func texts(s):
	match s:
		StringName("a"):
			print("C|sn-a")
		NodePath("a/b"):
			print("C|np-ab")
		String("a"):
			print("C|str-a")
		_:
			print("C|text-none")

func mixed(s):
	match s:
		Vector2(1, 2.5):
			print("C|vec2-mix")
		Vector2i(3, 4):
			print("C|vec2i-34")
		Vector2(Vector2(5, 6)):
			print("C|vec2-copy")
		Callable():
			print("C|callable")
		_:
			print("C|mixed-none")

func _initialize():
	cls(Vector2(1, 2))
	cls(Vector2(0, 0))
	cls(Vector2(1, 3))
	nums(Color(1, 2, 0, 1))
	nums(Color(1, 2, 3))
	nums(Color("ff0000"))
	nums(Color(0, 0, 0, 0))
	texts(&"a")
	texts(NodePath("a/b"))
	texts("a")
	texts(1)
	mixed(Vector2(1, 2.5))
	mixed(Vector2i(3, 4))
	mixed(Vector2(5, 6))
	mixed(Callable())
	mixed(1)
	quit()
