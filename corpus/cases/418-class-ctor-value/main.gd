extends SceneTree

class H:
	func _init():
		pass

func _initialize():
	var f = H.new
	print(f)
	print(typeof(f))
	print(f == H.new)
	var g: Callable = H.new
	print(g)
	print(H.new())
	quit()
