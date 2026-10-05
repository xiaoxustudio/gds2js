extends SceneTree

class Inner extends RefCounted:
	func three(a, b, c):
		return str(a, b, c)

	static func sm(a):
		return a

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
	quit()
