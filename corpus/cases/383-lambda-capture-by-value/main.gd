extends SceneTree

var mv = 1

func _initialize():
	var q = 7
	var f = func(): return q
	q = 9
	print("P1|", f.call(), " ", q)
	var twice = func(): return q * 2
	q = 20
	print("P2|", twice.call())
	var d = {}
	var mut = func(): d["k"] = 9
	mut.call()
	print("P3|", d)
	var coll = []
	for i in [1, 2, 3]:
		coll.append(func(): return i)
	var outs = []
	for g in coll:
		outs.append(g.call())
	print("P4|", outs)
	var outer = 5
	var nest = func(): return func(): return outer
	outer = 6
	print("P5|", nest.call().call())
	var mod = func(): return mv
	mv = 2
	print("P6|", mod.call(), " ", mv)
	var deff = func(x = q): return x
	q = 30
	print("P7|", deff.call())
	var selfl = func(): return typeof(self)
	print("P8|", selfl.call())
	var inner = func():
		var w = 7
		var g = func(): return w
		w = 9
		var h = func(y = w): return y
		return [g.call(), h.call(), w]
	print("P9|", inner.call())
	var acc = []
	var n = 1
	for k in [1, 2]:
		acc.append(func(): return k + n)
	n = 100
	var got = []
	for m in acc:
		got.append(m.call())
	print("P10|", got)
	quit()
