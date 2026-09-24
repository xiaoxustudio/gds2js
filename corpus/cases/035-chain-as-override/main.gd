extends SceneTree

func _initialize():
	var x = B.new()
	print(x.who())
	var y = x as A
	print(y.who())
	print(x is A)
	print(x is B)
	var z = A.new()
	print(z.who())
	print(z as B)
	quit()
