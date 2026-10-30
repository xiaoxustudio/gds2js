extends SceneTree


func _initialize():
	var add = func(x, y = 10):
		return x + y
	var shift = func(row, by = 2):
		return row * 10 + by
	print("a|", add.call(1), "|", add.call(1, 3), "|", shift.call(4), "|", add.callv([5, 6]))
	var cb = add.bind(7)
	print("b|", cb.call(1), "|", cb.get_argument_count(), "|", add.get_argument_count())
	quit()
