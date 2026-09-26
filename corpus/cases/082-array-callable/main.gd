extends SceneTree

var seen = []

func _pick(x):
	seen.append(x)
	return x > 2

func _add(acc, x):
	return acc + x

func _initialize():
	var a = [1, 2, 3, 4]
	print(a.filter(func(x): return x > 2))
	print(a)
	print(a.map(func(x): return x * 2))
	print(a.map(func(x): return x > 1))
	print([].filter(func(x): return true))
	print([].map(func(x): return x))
	print(a.any(func(x): return x > 3))
	print(a.all(func(x): return x > 0))
	print(a.all(func(x): return x > 1))
	print([].any(func(x): return true))
	print([].all(func(x): return false))
	print(a.find_custom(func(x): return x > 2))
	print(a.find_custom(func(x): return x > 100))
	print([].find_custom(func(x): return true))
	print(a.rfind_custom(func(x): return x > 2))
	print(a.find_custom(func(x): return x > 1, 2))
	print(a.find_custom(func(x): return x > 1, -1))
	print(a.rfind_custom(func(x): return x > 1, 0))
	print(a.rfind_custom(func(x): return x > 1, -9))
	print(a.reduce(func(acc, x): return acc + x, 0))
	print(a.reduce(func(acc, x): return acc + x))
	print([1, 2, 3].reduce(func(acc, x): return acc * 10 + x))
	print([5].reduce(func(acc, x): return acc + x))
	print([].reduce(func(acc, x): return acc + x, 5))
	print([].reduce(func(acc, x): return acc + x))
	# Callable 实参个数对不上 = 整次调用失败（Godot 只往 stderr 打诊断），各家解释不同
	print(a.map(func(x, i): return 1))
	print(a.filter(func(x, i): return true))
	print(a.any(func(x, i): return true))
	print(a.all(func(x, i): return true))
	print(a.find_custom(func(x, i): return true))
	print(a.reduce(func(acc): return acc, 0))
	print(a.reduce(func(acc, x): return acc + x, 100))
	# 方法名直接当 Callable：顺带钉出 any/all 的短路（seen 记录实际被调用过的元素）
	print(a.filter(_pick))
	print(seen)
	seen.clear()
	print(a.any(_pick))
	print(seen)
	seen.clear()
	print(a.all(_pick))
	print(seen)
	seen.clear()
	print(a.reduce(_add, 0))
	print(a.map(_add))
	print(a.map(_pick))
	print(seen)
	# 结果是新数组，但元素仍是原来的引用
	var nest = [[1]]
	var kept = nest.filter(func(x): return true)
	kept[0][0] = 9
	print(nest)
	var mapped = nest.map(func(x): return x)
	mapped[0][0] = 8
	print(nest)
	print([null, 1].filter(func(x): return x == null))
	print([null].map(func(x): return 5))
	var f = func(x): return x > 2
	print(a.filter(f))
	print(a.map(f))
	quit()
