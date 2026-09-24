extends SceneTree

func _initialize():
	var c = Child.new()
	print(c.greet())
	print(c.val())
	print(c is SupBase)
	quit()
