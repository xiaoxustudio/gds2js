extends SceneTree

class Holder:
	func g(x: int):
		print(x)

func _initialize():
	Callable(Holder.new(), "g").call("a")
	quit()
