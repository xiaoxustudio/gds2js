extends SceneTree

func _initialize():
	print([1, 2].append(3))
	print(([1, 2]).sort())
	print({1: 2}.merge({3: 4}))
	print(([1, 2]).make_read_only())
	quit()
