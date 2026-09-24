extends SceneTree

func add2(a, b):
	return a + b

func scale(x):
	return x * 2.0

func shout(s):
	return s + "!"

func idn(x):
	return x

func _initialize():
	var total = 0
	var i = 0
	while i < 3:
		total = add2(total, i)
		i += 1
	print(total)
	print(add2(100, 200) + 5)
	var arr = [add2(1, 2), add2(3, 4)]
	print(arr)
	print(scale(3.0))
	print(shout("hi"))
	print(idn(7))
	print(idn("s"))
	print(add2(7, 2))
	print(idn(2))
	quit()
