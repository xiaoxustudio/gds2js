extends SceneTree

func f(a: Array[Error]):
	print(a)

func _initialize():
	f([1.5])
	quit()
