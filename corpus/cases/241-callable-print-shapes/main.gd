extends SceneTree

class Inner extends RefCounted:
	func three(a, b, c):
		return str(a, b, c)

	static func sm(a):
		return a

class Cub extends RefCounted:
	static func sm(a):
		return a * 2

func top(a):
	return a

func _initialize():
	var o = Inner.new()
	var lam = func (x): return x
	var t = top
	print("q01|", o.three)
	print("q02|", typeof(o.three), "|", str([o.three]))
	print("q03|", Inner.sm)
	print("q04|", str([Inner.sm]))
	print("q05|", lam)
	print("q06|", str([lam]))
	print("q07|", Callable())
	print("q08|", str([Callable()]))
	print("q09|", o.three.bind(1))
	print("q10|", t)
	print("q11|", str([t, lam, Callable()]))
	print("q12|", "%s" % o.three)
	print("q14|", abs)
	print("q15|", var_to_str([o.three, lam, Callable(), abs, Inner.sm, t]))
	print("q16|", o.three.call(1, 2, 3), "|", Inner.sm.call(4))
	print("q17|", str(o.three), "|", typeof(o.three))
	print("q18|", o.three == o.three, "|", o.three == Inner.sm, "|", t == top)
	print("q19|", o.three.get_method(), "|", typeof(o.three.get_method()), "|", t.get_method())
	print("q20|", Inner.new().three, "|", o.three == Inner.new().three)
	var d = {}
	d[Inner.sm] = 1
	d[Cub.sm] = 2
	print("r01|", d.size(), "|", d[Inner.sm], "|", d[Cub.sm])
	print("r02|", str(d))
	print("r03|", d.has(Cub.sm), "|", d.erase(Cub.sm), "|", d.size())
	print("r04|", str([Inner.sm, Cub.sm]), "|", Inner.sm == Cub.sm)
	print("r05|", Inner.sm.call(3), "|", Cub.sm.call(3))
	print("r06|", str({Inner.sm: 1, Cub.sm: 2}))
	quit()
