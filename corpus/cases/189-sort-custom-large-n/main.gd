extends SceneTree

func build(n, mod):
	var a = []
	for i in range(n):
		a.append(Vector2i(i % mod, i))
	return a

func idx(a, rev):
	if rev:
		a.sort_custom(func(x, y): return x.x > y.x)
	else:
		a.sort_custom(func(x, y): return x.x < y.x)
	var out = ""
	for v in a:
		out += str(v.y) + " "
	return out

func _initialize():
	print("r ", idx(build(16, 1), false))
	print("r2 ", idx(build(17, 1), false))
	print("r3 ", idx(build(19, 1), false))
	print("r4 ", idx(build(33, 1), false))
	print("r5 ", idx(build(24, 3), false))
	print("r6 ", idx(build(30, 7), false))
	print("r7 ", idx(build(40, 5), true))
	print("r8 ", idx(build(100, 1), false))
	quit()
