extends SceneTree

func _initialize():
	print("V|Vector2.AXIS_X||", Vector2.AXIS_X, " | ", typeof(Vector2.AXIS_X))
	print("V|Vector2.AXIS_Y||", Vector2.AXIS_Y, " | ", typeof(Vector2.AXIS_Y))
	print("V|Vector2i.AXIS_X||", Vector2i.AXIS_X, " | ", typeof(Vector2i.AXIS_X))
	print("V|Vector2i.AXIS_Y||", Vector2i.AXIS_Y, " | ", typeof(Vector2i.AXIS_Y))
	print("V|Vector3.AXIS_X||", Vector3.AXIS_X, " | ", typeof(Vector3.AXIS_X))
	print("V|Vector3.AXIS_Y||", Vector3.AXIS_Y, " | ", typeof(Vector3.AXIS_Y))
	print("V|Vector3.AXIS_Z||", Vector3.AXIS_Z, " | ", typeof(Vector3.AXIS_Z))
	print("V|Vector3i.AXIS_X||", Vector3i.AXIS_X, " | ", typeof(Vector3i.AXIS_X))
	print("V|Vector3i.AXIS_Y||", Vector3i.AXIS_Y, " | ", typeof(Vector3i.AXIS_Y))
	print("V|Vector3i.AXIS_Z||", Vector3i.AXIS_Z, " | ", typeof(Vector3i.AXIS_Z))
	print("M|算式||", Vector3.AXIS_X - 1, " | ", Vector3.AXIS_Z * 2, " | ", Vector2.AXIS_Y == 1)
	print("M|数组||", [Vector3.AXIS_X, Vector3.AXIS_Y, Vector3.AXIS_Z], " | ", [Vector2i.AXIS_X, Vector2i.AXIS_Y])
	var i: int = Vector3.AXIS_Y
	print("T|int 标注||", i)
	var v = Vector2i.AXIS_X
	print("T|推断||", v, " | ", typeof(v))
	var vv = Vector3(10, 20, 30)
	print("T|v3 下标||", vv[Vector3.AXIS_Y])
	var v2 = Vector2(7.5, 2.5)
	print("T|v2 下标||", v2[Vector2.AXIS_X], " | ", v2[Vector2.AXIS_Y])
	var v2i = Vector2i(-3, 5)
	print("T|v2i 下标||", v2i[Vector2i.AXIS_Y])
	var v3i = Vector3i(4, 5, 6)
	print("T|v3i 下标||", v3i[Vector3i.AXIS_Z])
	print("A|arm0||", g(0))
	print("A|arm1||", g(1))
	print("A|arm2||", g(2))
	print("A|arm3||", g(3))
	quit()

func g(q) -> String:
	match q:
		Vector3.AXIS_X:
			return "x"
		Vector3i.AXIS_Y:
			return "y"
		Vector3.AXIS_Z when q == 2:
			return "z-guard"
		_:
			return "none"
