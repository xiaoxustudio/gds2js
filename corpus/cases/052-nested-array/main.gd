extends SceneTree

func _initialize():
	var g = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
	var s = 0
	var i = 0
	while i < 3:
		var j = 0
		while j < 3:
			s += g[i][j]
			j += 1
		i += 1
	print(s)
	print(g.size())
	print(g[2][1])
	var f = [[10, 20], [30, 40]]
	var n = 0
	var r = 0
	while r < f.size():
		n += f[r][0] + f[r][1]
		r += 1
	print(n)
	quit()
