extends SceneTree

func _initialize():
	var a = [1, 2, 3, 4, 5]
	var i = 0
	var n = a.size()
	while i < n / 2:
		var t = a[i]
		a[i] = a[n - 1 - i]
		a[n - 1 - i] = t
		i += 1
	print(a[0])
	print(a[4])
	print(a[2])
	var g = [[1, 2], [3, 4]]
	var r = 0
	while r < 2:
		var c = 0
		while c < 2:
			g[r][c] = g[r][c] + 100
			c += 1
		r += 1
	print(g[0][0])
	print(g[1][1])
	var s = 0
	var k = 0
	while k < 2:
		s += g[k][0] + g[k][1]
		k += 1
	print(s)
	quit()
