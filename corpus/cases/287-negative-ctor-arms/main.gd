extends SceneTree

func _initialize():
	var a = Vector2(-1, 2)
	match a:
		Vector2(-1, 2):
			print("A|v2 neg hit")
		Vector2(1, 2):
			print("A|other")
		_:
			print("A|miss")
	var b = Vector2(1, 2)
	match b:
		Vector2(-1, 2):
			print("B|wrong")
		_:
			print("B|miss")
	var c = Vector3(-1, -2, -3)
	match c:
		Vector3(-1, -2, -3):
			print("C|v3 neg hit")
		_:
			print("C|miss")
	var d = Vector2i(-1, 2)
	match d:
		Vector2i(-1, 2):
			print("D|v2i neg hit")
		_:
			print("D|miss")
	var e = Color(1, 2, 3, 1)
	match e:
		Color(1, 2, 3):
			print("E|c3 hit")
		_:
			print("E|miss")
	var f = Color(0, 0, 0, 0)
	match f:
		Color(0, 0, 0, 0):
			print("F|c4 hit")
		_:
			print("F|miss")
	quit()
