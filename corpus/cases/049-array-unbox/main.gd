extends SceneTree

func _initialize():
	var a = []
	var i = 0
	var s = 0
	while i < 3:
		a.append(i)
		s += a[i]
		i += 1
	print(s)
	print(a[1])
	print(a.size())
	var b = [1.5]
	var j = 0
	var s2 = 0.0
	b.append(2.0)
	b.append(2.5)
	while j < b.size():
		s2 += b[j]
		j += 1
	print(s2)
	var e = []
	e.append(7)
	var f = e
	f.append(8)
	print(e)
	print(e.size())
	var w = [1, 2]
	w[0] = 5
	print(w[0])
	quit()
