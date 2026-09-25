extends SceneTree

func _initialize():
	var a = [1, 2, 3]
	a.insert(0, 9)
	print(a)
	a.insert(2, 8)
	print(a)
	a.insert(10, 7)
	print(a)
	a.insert(6, 6)
	print(a)
	a.insert(-1, 5)
	print(a)
	a.insert(-9, 4)
	print(a)
	var emp = []
	emp.insert(0, 1)
	print(emp)
	emp.insert(5, 2)
	print(emp)
	emp.insert(-1, 3)
	print(emp)
	var p = [1, 2, 3]
	print(p.pop_front())
	print(p.pop_back())
	print(p)
	print(p.pop_at(0))
	print(p.pop_at(5))
	print(p.pop_at(-9))
	print(p)
	var q = [1, 2, 3]
	print(q.pop_at(-1))
	print(q)
	var r = []
	print(r.pop_front())
	print(r.pop_back())
	print(r.pop_at(0))
	print(r)
	var s = [2]
	s.push_front(1)
	s.push_back(3)
	print(s)
	var t = [1, 2, 3]
	t.remove_at(0)
	print(t)
	t.remove_at(5)
	print(t)
	t.remove_at(-1)
	print(t)
	t.remove_at(-9)
	print(t)
	var u = [1, 2, 3, 1]
	u.erase(2)
	print(u)
	u.erase(9)
	print(u)
	u.erase(1)
	print(u)
	var nest = [[1, 2], 3]
	nest.erase([1, 2])
	print(nest)
	var mix = [1.0, 1]
	mix.erase(1)
	print(mix)
	var rv = [1, 2, 3]
	rv.reverse()
	print(rv)
	rv.clear()
	print(rv)
	print(rv.is_empty())
	print([1].is_empty())
	var fl = [1, 2]
	var src = [9]
	fl.fill(src)
	print(fl)
	src[0] = 5
	print(fl)
	var sl = [1, 2, 3, 4, 5]
	print(sl.slice(1, 3))
	print(sl.slice(-2))
	print(sl.slice(1))
	print(sl.slice(0, 10))
	print(sl.slice(3, 1))
	print(sl.slice(0, 0))
	print(sl.slice(-9))
	print(sl.slice(-9, -6))
	print(sl.slice(2, -1))
	print(sl.slice(0, 5, 2))
	print(sl.slice(1, 4, 3))
	print(sl.slice(0, 5, -1))
	print(sl.slice(4, 1, -1))
	print(sl.slice(-1, -6, -1))
	print(sl.slice(9, 1, -1))
	print(sl.slice(0, 5, 0))
	print(sl)
	var sh = [[1], [2]]
	var shallow = sh.slice(0, 2)
	shallow[0][0] = 9
	print(sh)
	var deep = sh.slice(0, 2, 1, true)
	deep[1][0] = 8
	print(sh)
	print(deep)
	var dup = [[1]]
	var ds = dup.duplicate()
	ds[0][0] = 9
	print(dup)
	var dd = dup.duplicate(true)
	dd[0][0] = 5
	print(dup)
	print(dd)
	print(dup.duplicate().size())
	var ap = [1]
	ap.append_array([2, [3]])
	print(ap)
	var asrc = [[9]]
	var shared = []
	shared.append_array(asrc)
	asrc[0][0] = 7
	print(shared)
	var bs = [3]
	var asg = [1, 2]
	asg.assign(bs)
	bs[0] = 9
	print(asg)
	var nest_src = [[1]]
	var assigned = []
	assigned.assign(nest_src)
	nest_src[0][0] = 9
	print(assigned)
	var idn = [1, 1.0, true, null, &"a"]
	print(idn.has(1))
	print(idn.has(1.0))
	print(idn.has(true))
	print(idn.has(null))
	print(idn.has("a"))
	print(idn.find(1.0))
	print(idn.count(1))
	print(idn.count("a"))
	print([1].has(1.0))
	print([1].find(1.0))
	print([1].count(1.0))
	print([0].has(false))
	print([null].has(0))
	print([[1]].has([1.0]))
	print([[1]].find([1.0]))
	print([{"x": 1, "y": 2}].count({"y": 2, "x": 1}))
	print([Vector2(1, 2)].count(Vector2(1.0, 2.0)))
	print([Vector2(1, 2)].find(Vector2(1.0, 2.0)))
	var fr = [1, 2, 1, 2]
	print(fr.find(1))
	print(fr.find(1, 1))
	print(fr.find(1, 3))
	print(fr.find(1, 9))
	print(fr.find(1, -1))
	print(fr.rfind(1))
	print(fr.rfind(1, 0))
	print(fr.rfind(1, 1))
	print(fr.rfind(1, -2))
	print(fr.rfind(1, -4))
	print(fr.rfind(1, -9))
	print(fr.rfind(9))
	quit()
