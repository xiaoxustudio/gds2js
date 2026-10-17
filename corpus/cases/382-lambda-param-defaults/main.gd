extends SceneTree

func _initialize():
	var one = func(x = 5): return x
	print("L1|", one.call(), " ", one.call(9))
	var head = func(a, b = 2): return a + b
	print("L2|", head.call(7), " ", head.call(7, 5))
	var host = func(x = quit): return typeof(x)
	print("L3|", host.call())
	var selfd = func(x = self): return typeof(x)
	print("L4|", selfd.call())
	var arr = func(x = [1, 2]): return x
	print("L5|", arr.call(), " ", arr.call([3]))
	var chain = func(x = 1, y = x): return [x, y]
	print("L6|", chain.call(), " ", chain.call(2, 3))
	print("L7|", one.get_argument_count(), " ", head.get_argument_count(), " ", chain.get_argument_count())
	print("L8|", one.callv([]), " ", one.callv([2]))
	var calc = func(x = 3 * 4): return x
	print("L9|", calc.call())
	var strd = func(s = "a" + "b", n = 2): return s.repeat(n)
	print("L10|", strd.call(), " ", strd.call("c"), " ", strd.call("c", 3))
	quit()
