extends SceneTree

var m: Vector2 = Vector2(1, 2)

func bump(p: Vector2):
	p.x = 7
	print(p)

func make() -> Vector2:
	var t = Vector2(1, 2)
	return t

func _initialize():
	var v = Vector2(1, 2)
	v.x = 9
	print(v)
	v[0] = 1
	print(v)
	v["y"] = 5
	print(v)
	v[1] = 6
	print(v)
	var w = v
	w.x = 100
	print(v, " ", w)
	w[0] = 50
	print(v, " ", w)
	var a = [Vector2(1, 2)]
	a[0].x = 5
	print(a)
	var ta: Array[Vector2] = [Vector2(1, 2)]
	ta[0].y = 9
	print(ta)
	var d = {"k": Vector2(1, 2)}
	d["k"].x = 8
	print(d)
	var dn = {"k": [Vector2(1, 2)]}
	dn["k"][0].y = 4
	print(dn)
	for x in a:
		x.x = 100
	print(a)
	var r = make()
	r.x = 3
	print(r, " ", make())
	bump(v)
	print(v)
	v += Vector2(1, 1)
	print(v)
	v.y = v.y + 2.5
	print(v)
	m.x = 3
	print(m)
	var f = Vector2(1, 2)
	f.x = 0.1
	print(f.x)
	print(f)
	var big = Vector2(1, 2)
	big.x = 1e20
	print(big)
	var neg = Vector2(1, 2)
	neg.x = -2.5
	print(neg)
	print(v == null)
	print(null == v)
	print(v == Vector2(2, 6))
	print(v != Vector2(2, 6))
	var kv = {"x": Vector2(1, 2)}
	print(kv["x"] == Vector2(1, 2))
	var store = Vector2(1, 2)
	var arr = [store]
	store.x = 3
	print(arr, " ", store)
	print(arr[0].x, " ", arr[0][0])
	quit()
