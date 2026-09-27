extends SceneTree

func _initialize():
	var a = []
	for i in range(5):
		a.append(i)
	a.insert(2, 9)
	print("n1 ", a.size(), " ", a[2], " ", a[5])
	a.push_front(7)
	print("n2 ", a[0], " ", a.size())
	a.remove_at(0)
	a.pop_back()
	a.pop_front()
	a.pop_at(1)
	print("n3 ", a.size(), " ", a[0], " ", a[1], " ", a[2])
	a.insert(99, 5)
	print("n4 ", a.size())
	a.remove_at(-1)
	print("n5 ", a.size(), " ", a[0], " ", a[1])
	var s = []
	s.append("x")
	s.append("y")
	s.insert(1, "z")
	print("n6 ", s.size(), " ", s[0], " ", s[1], " ", s[2])
	s.fill("w")
	print("n7 ", s[0], " ", s[2])
	s.clear()
	print("n8 ", s.size())
	var b = [1, 2]
	var st = b.insert(0, 3)
	print("n9 ", st, " ", b[0], " ", b.size())
	var bad = b.insert(9, 4)
	print("n10 ", bad)
	var d = {}
	d[1] = 10
	d[2] = 20
	print("n11 ", d.get(1), " ", d.get(3, 99), " ", d.get(2, 0), " ", d.size())
	var sd = {}
	sd["k"] = 5
	print("n12 ", sd.get("k", 0), " ", sd.get("j", 7))
	var mixed = {}
	mixed[1] = 2
	print("n13 ", mixed.get("nope"), " ", mixed.size())
	var q = [1, 2, 3]
	q.insert(-1, 4)
	print("n14 ", q.size(), " ", q[0], " ", q[1], " ", q[2], " ", q[3])
	q.insert(-4, 5)
	print("n15 ", q.size(), " ", q[0], " ", q[1])
	q.pop_at(-1)
	q.remove_at(-2)
	print("n16 ", q.size(), " ", q[0], " ", q[1])
	var only = [1]
	only.pop_back()
	only.pop_front()
	only.pop_at(0)
	only.remove_at(0)
	print("n17 ", only.size())
	var r = [1, 2, 3]
	r.push_back(4)
	r.reverse()
	print("n18 ", r[0], " ", r[1], " ", r[2], " ", r[3])
	quit()
