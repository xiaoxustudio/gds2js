extends SceneTree

class Box:
	var m: Vector2 = Vector2(1, 2)
	func getm():
		return m

func _initialize():
	var p = Box.new()
	p.m.x = 5
	print("u1 ", p.m)
	p.m[1] = 7
	print("u2 ", p.m)
	var arr = [p]
	arr[0].m.x = 9
	print("u3 ", p.m, " ", arr[0].m)
	var d = {"k": p}
	d["k"].m.y = 3
	print("u4 ", p.m)
	var q = p.m
	q.x = 50
	print("u5 ", p.m, " ", q)
	print("u6 ", p.getm())
	print("u7 ", p.m[0], " ", p.m[1], " ", p.m.y)
	quit()
