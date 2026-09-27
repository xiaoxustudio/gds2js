extends SceneTree

static var osv: int = 1

static func bumpOuter():
	osv += 1
	return osv


class A:
	static var x: int = 1
	static var plain = 2
	static var lit = [1, 2]
	static var computed: int = 3 * 7
	var mv: int = 9

	static func setx(v):
		x = v
		return x

	func fromInstance():
		return x


func _initialize():
	var p = A.new()
	var q = A.new()
	print("u1 ", A.x)
	print("u2 ", A.plain)
	print("u3 ", A.lit)
	print("u4 ", A.computed)
	print("u5 ", A.setx(9), " ", A.x)
	print("u6 ", A.setx(2.7), " ", A.x)
	A.x = 100
	print("u7 ", A.x)
	print("u8 ", p.x)
	p.x = 200
	print("u9 ", A.x, " ", p.x, " ", q.x)
	print("u10 ", p.fromInstance(), " ", q.fromInstance())
	print("u11 ", p.setx(5), " ", A.x)
	print("u12 ", bumpOuter(), " ", osv)
	print("u13 ", self.osv)
	print("u14 ", A.x, " ", p.mv)
	quit()
