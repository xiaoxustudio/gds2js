extends SceneTree

class Inner:
	var m = 1
	var t: int = 2
	var s: String = "a"
	var v: Vector2 = Vector2(0, 0)

func _initialize():
	var p = Inner.new()
	p.m = 5
	print("a1 ", p.m)
	p.m += 3
	print("a2 ", p.m)
	p.t = 5.5
	print("a3 ", p.t)
	p.t = "12abc"
	print("a4 ", p.t)
	p.s = &"nm"
	print("a5 ", p.s, " ", typeof(p.s))
	p.v = Vector2i(3, 4)
	print("a6 ", p.v)
	var arr = [p, p]
	arr[0].m = 11
	print("a7 ", arr[1].m, " ", p.m)
	var d = {"k": p}
	d["k"].m = 12
	print("a8 ", p.m)
	var q = p
	q.m = 13
	print("a9 ", p.m, " ", q.m)
	p.m = p.m * 2
	print("a10 ", p.m)
	quit()
