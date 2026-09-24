extends SceneTree

func _initialize():
	var G = preload("res://greeter.gd")
	print(G.new().greet("bob"))

	print(preload("res://point.gd").new() is Point)

	print(load("res://greeter.gd").new().greet("zed"))
	quit()
