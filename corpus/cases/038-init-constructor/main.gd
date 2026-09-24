extends SceneTree

func _initialize():
	var c = C038.new("x", "y")
	print(c.show())
	var b = B038.new("z")
	print(b.show())
	print(c is B038)
	quit()
