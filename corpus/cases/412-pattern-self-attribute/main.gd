extends SceneTree

var x = 1

func _init():
	match x:
		self.x:
			print("arm")
		_:
			print("default")
	quit()
