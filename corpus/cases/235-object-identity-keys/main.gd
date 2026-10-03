extends SceneTree

signal fired

class Thing extends RefCounted:
	var n = 1
	func m(a):
		return a

func _initialize():
	var p := Thing.new()
	var q := p
	var a := Thing.new()
	var b := Thing.new()
	print("1|", p == q, "|", p == p, "|", a == b, "|", p != a, "|", p == null, "|", null == p)
	print("2|", p.get_instance_id() == q.get_instance_id(), "|", a.get_instance_id() == b.get_instance_id(), "|", p.get_instance_id() == p.get_instance_id(), "|", typeof(p.get_instance_id()))
	var d := {}
	d[p] = 1
	d[q] = 2
	print("3|", d.size(), "|", d[p], "|", d.has(p), "|", d.has(Thing.new()))
	d[a] = 3
	print("4|", d.size(), "|", d.has(p), "|", d.has(a), "|", d.has(b))
	print("5|", d.keys()[0] == p, "|", d.keys()[1] == a)
	p.n = 99
	print("6|", d.has(q), "|", d[q])
	print("7|", d.erase(p), "|", d.size(), "|", d.has(a), "|", d.erase(b))
	var e := {}
	e[null] = 1
	print("8|", e.size(), "|", e[null], "|", e.has(null), "|", e.has(p))
	var f := {}
	f[p] = 1
	print("9|", f.size(), "|", f[p] == 1)
	var g := {}
	g[Thing.new()] = 1
	g[Thing.new()] = 2
	print("10|", g.size())
	var arr := [p, a, p]
	print("11|", arr.has(q), "|", arr.has(b), "|", arr.count(p), "|", arr.find(a), "|", arr.find(b))
	arr.erase(q)
	print("12|", arr.size(), "|", arr.has(p), "|", arr.has(a))
	print("13|", [p] == [p], "|", [p] == [q], "|", [p] == [a], "|", [p, a] == [p, a])
	print("14|", {p: 1} == {p: 1}, "|", {p: 1} == {a: 1}, "|", {p: 1} == {q: 2})
	var du := [p, a].duplicate()
	print("15|", du.has(p), "|", du == [p, a])
	var c1 := p.m
	var c2 := p.m
	var ca := a.m
	print("16|", c1 == c2, "|", c1 == p.m, "|", c1 == ca, "|", typeof(c1))
	var cd := {}
	cd[c1] = 1
	cd[c2] = 2
	print("17|", cd.size(), "|", cd[c1], "|", cd.has(ca))
	cd[ca] = 3
	print("18|", cd.size(), "|", cd[c1], "|", cd[ca])
	var s1 := c1.bind(1)
	var s2 := c1.bind(2)
	print("19|", s1 == s2, "|", c1 == s1, "|", s1 == c1)
	var ce := {}
	ce[s1] = 1
	ce[s2] = 2
	print("20|", ce.size(), "|", ce[s1], "|", ce.has(c1))
	print("21|", c1.call(3), "|", s2.call())
	var l := func(x):
		return x
	print("22|", l == l, "|", l == (func(y):
		return y))
	var le := {}
	le[l] = 1
	print("23|", le.size(), "|", le[l], "|", [l].has(l))
	quit()
