extends SceneTree

# 实测：Array.sort() 自己那条比较器 —— 形不同只有 int 对 float 有方向，同形才比值，其余比不出、原地不动。
func s(label, items):
	items.sort()
	print(label, " → ", items)

func _initialize():
	s("int混float", [2, 1.5, 1, 2.5])
	s("串按码点", ["b", "A", "a", "ab"])
	s("向量按分量", [Vector2(1, 2), Vector2(0, 3), Vector2i(1, 2), Vector2i(0, 3)])
	s("RID按无符号号", [rid_from_int64(-1), rid_from_int64(8), rid_from_int64(7)])
	s("数组按装箱序", [[1, 2], [1], [], [2]])
	s("bool与null", [true, false, null])
	s("跨形原地不动", [1, "a", null, &"n"])
	s("Color原地不动", [Color(1, 0, 0, 1), Color(0, 1, 0, 1)])
	s("字典原地不动", [{"b": 1}, {"a": 1}])
	s("NodePath原地不动", [^"b", ^"a"])
	s("pack原地不动", [PackedInt32Array([2]), PackedStringArray(["b"]), PackedByteArray([1])])
	s("十七乱序int", [16, 0, 15, 1, 14, 2, 13, 3, 12, 4, 11, 5, 10, 6, 9, 7, 8])
	s("廿一混形", [20, "t", 19, 1.5, null, ^"p", Vector2(1, 2), Vector2i(1, 2), Vector3(1, 2, 3), Vector3i(1, 2, 3), Color(1, 0, 0, 1), rid_from_int64(7), [1], {"a": 1}, PackedInt32Array([1]), 3, 2.5, true, 1, 1.5, 0])
	quit()
