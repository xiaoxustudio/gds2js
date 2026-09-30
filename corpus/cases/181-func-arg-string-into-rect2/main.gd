extends SceneTree

func rr(a: Rect2):
	print("a ", a)

func _initialize():
	rr("1,2,3,4")
	quit()
