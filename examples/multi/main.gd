extends SceneTree

func _initialize():
	var p = GpShape.new()
	p.set2(3, 4)
	print(p.sum())
	print(p is GpPoint)
	print(p.tag())

	var G = preload("res://greeter.gd")
	var g = G.new()
	print(g.greet("bob"))

	var pt = preload("res://point.gd").new()
	print(pt is GpPoint)

	var g2 = load("res://greeter.gd").new()
	print(g2.greet("zed"))
	quit()
