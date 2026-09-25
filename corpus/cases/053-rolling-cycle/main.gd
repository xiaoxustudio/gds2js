extends SceneTree

func pick(x, y):
	if x > y:
		return x
	return y

func _initialize():
	var a = 0
	var b = 1
	var i = 0
	while i < 12:
		var t = (a + b) % 100
		a = b
		b = t
		i += 1
	print(a)
	print(b)

	var p = 0
	var q = 0
	var j = 0
	while j < 6:
		p = q
		q = pick(q, j)
		j += 1
	print(p)
	print(q)

	var x = 1.5
	var y = 2.5
	var r = 0
	while r < 5:
		var z = x * 0.5 + y
		x = y
		y = z
		r += 1
	print(x)
	print(y)

	var g = 0
	var h = 1.0
	var w = 0
	while w < 4:
		g = w
		h = g * 1.5
		w += 1
	print(g)
	print(h)

	var c = 0
	if g > 1:
		var u = c
		c = u + 3
	else:
		var u2 = "no"
		c = c + 1
	print(c)
	quit()
