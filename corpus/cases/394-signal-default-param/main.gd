extends SceneTree

signal s1(a: int = 1)
signal s2(a: int = "s", b: bool = true)
signal s3(a: int)
signal s4

class Inner:
	signal s5(a: Vector2 = null)

func _initialize():
	print("ok")
	quit()
