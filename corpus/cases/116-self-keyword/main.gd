extends SceneTree

class Box:
	var n = 1
	func getn():
		return n
	func readself():
		return self.n
	func bump():
		self.n = self.n + 1
		return self.n
	func setn(v):
		self.n = v
		return self.n
	func me():
		return self
	func sameother(o):
		return o == self
	func ty():
		return typeof(self)

var outervar = 7
var outer_self = self

func useobj(o):
	return o.getn()

func hello():
	print("s12 hello via self call")

func _initialize():
	var b = Box.new()
	print("s1 ", b.readself(), " ", b.n)
	print("s2 ", b.bump(), " ", b.readself())
	print("s3 ", b.setn(10), " ", b.n)
	print("s4 ", useobj(b))
	print("s5 ", b.me() == b, " ", b.sameother(b))
	print("s6 ", b.ty(), " ", typeof(b))
	print("s7 ", typeof(self), " ", self == null)
	print("s8 ", self.outervar)
	self.outervar = 42
	print("s9 ", self.outervar, " ", outervar)
	self.outervar += 8
	print("s10 ", self.outervar)
	print("s11 ", outer_self == self)
	self.hello()
	quit()
