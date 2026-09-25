extends SceneTree

var member: Array[int] = [7]

func _initialize():
	# 字面量初值 Godot 允许并逐格转换（实测 bool/int/float/StringName 都进得来）
	var a: Array[int] = [1, 2.5, -1.9, true]
	print(a)
	a.append(3)
	a.append(4.9)
	a.append("s")
	a.append(null)
	print(a)
	print(a.pop_front())
	print(a.pop_back())
	print(a)
	print(a.count(1))
	print(a.find(1.0))
	print(a.has(1.0))
	print(a.rfind(1))
	a.insert(0, 2.2)
	print(a)
	a.insert(0, "x")
	print(a)
	var alias = a
	alias[0] = 9.8
	print(a)
	alias[0] = "no"
	print(a)
	a.resize(6)
	print(a)
	a.resize(2)
	print(a)
	a.fill(5.7)
	print(a)
	print(a.duplicate(true).pop_back())
	print(a)
	print(a.slice(0, 2).pop_back())
	print(a)
	var f: Array[float] = []
	f.append(1)
	f.append(true)
	f.append(2.5)
	print(f)
	var s: Array[String] = ["a", &"b"]
	print(s)
	s.append(3)
	print(s)
	var nm: Array[StringName] = []
	nm.append("x")
	nm.resize(3)
	print(nm)
	var b: Array[bool] = [0, 1]
	print(b)
	b.append("t")
	b.append(2.5)
	print(b)
	var v: Array[Vector2] = []
	v.resize(2)
	print(v)
	v.append(1)
	print(v)
	var na: Array[Array] = []
	na.resize(2)
	print(na)
	var nd: Array[Dictionary] = []
	nd.resize(1)
	print(nd)
	# filter / duplicate / slice 保留定型；map 与 + 不保留（全部实测）
	var filtered = a.filter(func(x): return true)
	filtered.append("s")
	print(filtered)
	var mapped = a.map(func(x): return x)
	mapped.append("s")
	print(mapped)
	var joined = a + [1]
	joined.append("s")
	print(joined)
	# append_array / assign 是全有或全无
	a.assign([2.5, 3.5])
	print(a)
	a.assign([4, "s"])
	print(a)
	a.append_array([1, "s"])
	print(a)
	a.append_array([6.5, 7.5])
	print(a)
	member.append(2.5)
	print(member)
	# 未定型数组对照：resize 填 null，什么都能塞
	var u = [1]
	u.resize(3)
	u.append("s")
	print(u)
	# 定型字典：值按元素类型转换
	var d: Dictionary[String, int] = {"a": 1.9}
	print(d)
	d["b"] = 2.7
	print(d)
	var dalias = d
	dalias["c"] = 3.5
	print(d)
	print(d.keys())
	print(d.values())
	var dc = d.duplicate()
	dc["z"] = 4.5
	print(dc)
	print(d)
	var ds: Dictionary[String, String] = {}
	ds["k"] = &"v"
	print(ds)
	var dv: Dictionary[int, Array] = {}
	dv[1] = [2]
	print(dv)
	# 检索值也先按元素/键类型收成同类型再比（未定型数组同一条查询是 -1，见 080）
	var q: Array[int] = [1, 2]
	print(q.has(1.0))
	print(q.count(1.0))
	print(q.find(1.0))
	print(q.rfind(1.0))
	q.erase(2.5)
	print(q)
	var qs: Array[String] = ["x"]
	print(qs.has(&"x"))
	print(qs.find(&"x"))
	var qb: Array[int] = [1]
	print(qb.has(true))
	print(qb.count(true))
	var dq: Dictionary[String, int] = {"a": 1}
	print(dq.has(&"a"))
	print(dq.get(1))
	print(dq.find_key(1.0))
	dq.erase("a")
	print(dq)
	quit()
