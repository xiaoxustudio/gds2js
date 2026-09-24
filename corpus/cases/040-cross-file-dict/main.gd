extends SceneTree

func _initialize():
	var b = Builder.new()
	var p = b.make_pair("L", "R")
	print(b.describe(p))
	print(p["x"])
	print(p.keys())
	quit()
