extends SceneTree

class Inner:
	func m(x):
		return x

func _initialize():
	match 1:
		Inner.m(1):
			print("arm")
		_:
			print("default")
	quit()
