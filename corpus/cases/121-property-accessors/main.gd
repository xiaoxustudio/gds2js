extends SceneTree

class Inner:
	var raw = 0
	var prop: int:
		get:
			print("g")
			return raw
		set(value):
			print("s ", value * 2)
			raw = value * 2
	var ro: int:
		get:
			return 7
	var ref: int:
		get = _getr,
		set = _setr
	var rraw = 0
	func _getr():
		print("G")
		return rraw
	func _setr(v):
		print("S ", v)
		rraw = v
	func setvia(v):
		self.prop = v
		return raw

func _initialize():
	var p = Inner.new()
	p.prop = 3
	print("m1 ", p.prop, " ", p.raw)
	p.prop += 1
	print("m2 ", p.prop, " ", p.raw)
	print("m3 ", p.ro)
	p.ro = 9
	print("m4 ", p.ro)
	print("m5 ", p.setvia(2.7), " ", p.raw)
	p.ref = 4
	print("m6 ", p.ref, " ", p.rraw)
	p.ref += 1
	print("m7 ", p.ref, " ", p.rraw)
	var q = 8
	p.ref = q
	print("m8 ", p.rraw)
	quit()
