extends SceneTree

var td: Dictionary[Array, int] = {}

func _initialize():
	var d = {}
	var a = [1, 2]
	d[a] = 5
	print(d)
	print(d.has(a), " ", d.has([1, 2]), " ", d[[1, 2]], " ", d.get([1.0, 2.0], "M"))
	d[[1, 2]] = 6
	print(d, " size=", d.size())
	var e = { "x": 1 }
	d[e] = 7
	print(d, " ", d.get({ "x": 1 }, "M"), " ", d.get({ "x": 1.0 }, "M"))
	print(d.keys(), " size=", d.size())
	var od = {}
	od[{ "a": 1, "b": 2 }] = 9
	print(od.get({ "b": 2, "a": 1 }, "M"), " ", od.get({ "a": 1, "b": 2 }, "M"))
	var m = [1]
	d[m] = 8
	m.append(2)
	print(d.size(), " ", d.has([1]), " ", d.has(m), " ", d)
	var c1 = [7, 8]
	var d2 = {}
	d2[c1] = 1
	c1.append(9)
	d2[[7, 8]] = 2
	print(d2, " size=", d2.size(), " ", d2.get([7, 8], "M"), " ", d2.get(c1, "M"))
	print(d2.erase([7, 8]), " ", d2.erase(c1), " size=", d2.size())
	var k3 = [1]
	var d3 = {}
	d3[k3] = 1
	print(d3.erase([1]), " ", d3.erase([1]), " size=", d3.size())
	var sh = {}
	var kk = [1, 2]
	sh[kk] = 1
	var cp = sh.duplicate()
	kk.append(3)
	print(cp.get([1, 2], "M"), " ", cp.get([1, 2, 3], "M"), " ", cp)
	var dp = sh.duplicate(true)
	print(dp.get([1, 2, 3], "M"), " ", dp.get([1, 2], "M"), " ", dp)
	var v = Vector2(1, 2)
	var d4 = { Vector2(1, 2): 1 }
	d4[v] = 2
	print(d4, " size=", d4.size(), " ", d4.has(Vector2(1.0, 2.0)))
	v.x = 9
	print(d4.has(v), " ", d4.get(Vector2(1, 2), "M"))
	var ta: Array[Vector2] = [Vector2(1, 2)]
	var d5 = {}
	d5[ta] = 3
	print(d5, " ", d5.get([Vector2(1, 2)], "M"))
	td[[1, 2]] = 5
	print(td, " ", td.get([1, 2], "M"), " ", td.get([1.0, 2.0], "M"))
	var d6 = {}
	d6[[]] = 1
	d6[{}] = 2
	print(d6, " ", d6.get([], "M"), " ", d6.get({}, "M"))
	var d7 = {}
	d7[[1]] = 1
	print(d7.get([1], "M"), " ", d7.get([1.0], "M"), " ", d7.get([true], "M"), " ", d7.get([0], "M"))
	var inner = [1]
	var d8 = {}
	d8[[inner]] = 8
	inner.append(2)
	print(d8.get([[1]], "M"), " ", d8, " ", d8.values())
	var d9 = {}
	d9[[1]] = "one"
	d9["s"] = "two"
	for key in d9:
		print(key, " -> ", d9[key])
	var da = { "z": {} }
	var db = {}
	db[da] = 1
	da["z"]["y"] = 1
	print(db.get({ "z": {} }, "M"), " ", db.get({ "z": { "y": 1 } }, "M"), " ", db)
	quit()
