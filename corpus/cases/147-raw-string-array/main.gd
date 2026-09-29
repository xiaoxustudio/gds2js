extends SceneTree

func _initialize():
	var names = ["ann", "bob", "cy"]
	var s = ""
	var i = 0
	while i < names.size():
		s = s + names[i] + ","
		i += 1
	print("t1 ", s, " ", names.size())
	names[0] = "zoe"
	names.append("最大")
	print("t2 ", names[0], " ", names[3], " ", names[-1].length(), " ", names[1].to_upper())
	var g = [["a", "b"], ["c", "d"]]
	print("t3 ", g[0][1], " ", g[1][0], " ", g.size())
	g[0][0] = "z"
	print("t4 ", g[0][0], " ", g[0][1])
	var acc = []
	var k = 0
	while k < 3:
		acc.append(names[k] + "!")
		k += 1
	print("t5 ", acc[0], " ", acc[2], " ", acc.size())
	var mix = []
	mix.append("x")
	mix.append(1)
	print("t6 ", mix[0], " ", mix[1], " ", mix.size())
	quit()
