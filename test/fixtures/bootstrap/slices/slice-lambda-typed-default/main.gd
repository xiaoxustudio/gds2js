extends SceneTree


func _initialize():
	var add = func(x: int, y: int = 10) -> int:
		return x + y
	print("a|", add.call(1), "|", add.call(1, 3))
	var cb = add.bind(5)
	print("b|", cb.call(), "|", cb.call(9), "|", cb.get_argument_count())
	var pick = func(row: Array = [1, 2]) -> int:
		return row.size()
	print("c|", pick.call(), "|", pick.call([7, 8, 9]))
	quit()
