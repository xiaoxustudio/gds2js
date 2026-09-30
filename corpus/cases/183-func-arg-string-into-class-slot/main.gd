extends SceneTree

class Thing:
	func hi():
		return 7

func use(t: Thing):
	print("t ", t.hi())

func _initialize():
	use("12abc")
	quit()
