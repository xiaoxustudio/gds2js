extends SceneTree

func _initialize():
	var m = Mutator.new()
	var a = [1, 2]
	m.add_one(a)
	print(a)
	print(a.size())
	var d = {"k": 5}
	m.bump(d)
	print(d["k"])
	quit()
