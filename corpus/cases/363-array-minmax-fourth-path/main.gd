extends SceneTree

# 实测：min() / max() 是第四条比较口子 —— 基准是第一个元素，碰到比不了的组合整串当场给 null，一行错误都不推。
func p(items):
	print(items, " → ", items.min(), " | ", items.max())

func _initialize():
	p([3, 1, 2])
	p([1, 1.5])
	p([true, false])
	p(["b", "a", "c"])
	p([Vector2(1, 2), Vector2(0, 3), Vector2(5, 0)])
	p([rid_from_int64(8), rid_from_int64(7), rid_from_int64(9)])
	p([[2], [1], [3]])
	p([1, "a", 0])
	p([2, null, 1])
	p([2, Color(1, 0, 0, 1), 1])
	p([{"b": 1}, {"a": 1}])
	p([PackedInt32Array([2]), 1])
	p([NAN, 1.5, 2])
	p([1.5, NAN, 2])
	p([])
	quit()
