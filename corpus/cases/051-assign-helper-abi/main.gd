extends SceneTree

func tri(x):
	var y = x * 3
	var z = y + x
	return z

func shout(s):
	var t = s + "!"
	return t

func mix(a, b):
	var t = a + b
	print(t)
	return t

func choose(x):
	if x > 0:
		return x
	return 0

func _initialize():
	var s = 0
	var i = 0
	while i < 3:
		s = tri(i)
		i += 1
	print(s)
	print(tri(10))
	print(shout("hi"))
	print(mix(2, 3))
	print(choose(5))
	quit()
