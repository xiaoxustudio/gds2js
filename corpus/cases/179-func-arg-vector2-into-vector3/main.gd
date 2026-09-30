extends SceneTree

func v3(a: Vector3):
	print("a ", a)

func _initialize():
	v3(Vector2(1.7, 2.9))
	quit()
