extends SceneTree

func a1(v: int = "s"):
	pass

func a2(v: String = 1):
	pass

func a3(v: Array = {"k": 1}):
	pass

func a4(v: Rect2 = null):
	pass

func a5(v: Vector2 = Color(1, 2, 3, 4)):
	pass

func a6(v: StringName = ^"a/b"):
	pass

class Inner:
	func b1(v: int = 1.5e30):
		pass

func b2():
	var lam = func(v: String = 1):
		return 1
	return lam

func b3():
	var ok = func(v: String = ^"a/b"):
		return 1
	return ok

func _initialize():
	print("ok")
	quit()
