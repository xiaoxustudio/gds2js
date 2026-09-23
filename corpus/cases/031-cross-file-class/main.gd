extends SceneTree

func _initialize():
	var p = Shape.new()
	p.set2(3, 4)
	print(p.sum())
	print(p is Point)
	print(p is Shape)
	print(p.tag())
	quit()
