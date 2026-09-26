extends SceneTree

func _initialize():
	var a = 9007199254740993.0
	print("f1 ", int(a), " | ", a)
	var b = 9007199254740993.5
	print("f2 ", int(b))
	var c = 0.1234567890123456789
	print("f3 ", int(c * 1e17), " | ", c)
	var d = 0.0000001234567890123456789
	print("f4 ", int(d * 1e25), " | ", d)
	var e = 1.000000000000000083266726846886739642044414197265625
	print("f5 ", int(e * 1e18))
	var f = 100000000000000001.0
	print("f6 ", int(f))
	var g = 1234567890123456789.0
	print("f7 ", int(g))
	var h = 0.999999999999999999999
	print("f8 ", h, " | ", int(h))
	print("f9 ", int(1e-23 * 1e30), " | ", 1e-23 * 1e30)
	print("f10 ", a == 9007199254740994.0, " | ", a > 9007199254740992.0, " | ", d < 0.00000012345678901)
	var i = 1_000_000.25
	print("f11 ", int(i), " | ", i)
	var j = -9007199254740993.0
	print("f12 ", int(j))
	quit()
