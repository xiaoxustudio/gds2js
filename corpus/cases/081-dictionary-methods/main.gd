extends SceneTree

func _initialize():
	var d = {"a": 1, "b": 2}
	print(d.erase("a"))
	print(d)
	print(d.erase("zz"))
	print(d)
	print(d.has("b"))
	var c = {1: 2}
	c.clear()
	print(c)
	print(c.size())
	print(c.is_empty())
	print({1: 2}.is_empty())
	var m = {"a": 1}
	m.merge({"a": 9, "b": 2})
	print(m)
	m.merge({"a": 9}, false)
	print(m)
	m.merge({"a": 9}, true)
	print(m)
	m.merge({})
	print(m)
	var ha = {"a": 1, "b": 2}
	print(ha.has_all(["a", "b"]))
	print(ha.has_all(["a", "z"]))
	print(ha.has_all([]))
	print({}.has_all([]))
	var fk = {"a": 1, "b": 2}
	print(fk.find_key(2))
	print(fk.find_key(1))
	print(fk.find_key(99))
	print(fk.get("a"))
	print(fk.get("zz"))
	print(fk.get("zz", 7))
	print(fk[&"a"])
	print(fk.has(&"a"))
	var dd = {"k": [1]}
	var ds = dd.duplicate()
	ds["k"][0] = 9
	print(dd)
	var deep = dd.duplicate(true)
	deep["k"][0] = 5
	print(dd)
	print(deep)
	var eo = {}
	var es = eo.duplicate()
	es["k"] = 1
	print(eo)
	print(es)
	var order = {}
	order["b"] = 1
	order["a"] = 2
	order["b"] = 3
	print(order.keys())
	print(order.values())
	order.erase("b")
	order["b"] = 4
	print(order.keys())
	var asg = {"x": 1}
	var src = {"y": 2}
	asg.assign(src)
	src["y"] = 9
	print(asg)
	var eq1 = {"x": 1, "y": 2}
	var eq2 = {"y": 2, "x": 1}
	print(eq1 == eq2)
	print(eq1 != eq2)
	print(eq1 == {"x": 1})
	var nest = {"l": [1, {"n": 2}]}
	print(nest)
	print(nest.duplicate(true) == nest)
	print(nest.duplicate(true)["l"] == nest["l"])
	quit()
