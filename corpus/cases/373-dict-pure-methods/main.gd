extends SceneTree

# 实测：Dictionary 的三支纯方法 —— merged 不改接收者且是浅拷、get_or_add 键在就给现值不在才落默认值、recursive_equal 与 == 同口径（S377）。
func _initialize():
	var a = {"a": 1}
	print("merged 并新键 → ", a.merged({"b": 2}), " | 接收者 ", a)
	print("merged 同键不覆盖 → ", a.merged({"a": 2}))
	print("merged 同键覆盖 → ", a.merged({"a": 2}, true))
	print("merged 的键序 → ", {"b": 1}.merged({"a": 2, "c": 3}))
	print("merged 不深挖 → ", {"k": {"x": 1}}.merged({"k": {"y": 2}}, true))
	var base = {"x": 1}
	var copy = base.merged({})
	copy["y"] = 2
	print("merged 给的是新字典 → ", base, " | ", copy)
	var inner = {"n": 1}
	var shallow = {"k": inner}.merged({})
	shallow["k"]["n"] = 9
	print("merged 的值是浅拷 → ", inner)
	var g = {"k": 1}
	print("get_or_add 键已在 → ", g.get_or_add("k", 9), " | ", g)
	print("get_or_add 键不在 → ", g.get_or_add("j", 9), " | ", g)
	print("get_or_add 单实参落 null → ", g.get_or_add("z"), " | ", g)
	var ord = {"k": 1, "m": 2}
	ord.get_or_add("j", 9)
	print("get_or_add 键序 → ", ord.keys())
	var shared = {}
	var inner2 = {"x": 1}
	var got = shared.get_or_add("k", inner2)
	got["y"] = 2
	print("get_or_add 装的是同一份 → ", shared, " | ", inner2)
	print("recursive_equal 相等 → ", {"a": 1}.recursive_equal({"a": 1}, 0))
	print("recursive_equal 计数不影响 → ", {"a": 1}.recursive_equal({"a": 1}, 99), " | ", {"a": 1}.recursive_equal({"a": 1}, -1))
	print("recursive_equal 嵌套 → ", {"a": {"b": [1, 2]}}.recursive_equal({"a": {"b": [1, 2]}}, 0))
	print("recursive_equal 键序 → ", {"a": 1, "b": 2}.recursive_equal({"b": 2, "a": 1}, 0))
	print("recursive_equal 不等 → ", {"a": 1}.recursive_equal({"a": 2}, 0))
	print("recursive_equal 深层不等 → ", {"a": {"b": [1, 2]}}.recursive_equal({"a": {"b": [1, 3]}}, 0))
	print("recursive_equal 与 == 同口径 → ", {"a": {"b": 1}} == {"a": {"b": 1}})
	quit()
