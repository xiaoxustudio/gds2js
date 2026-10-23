extends SceneTree

class Holder:
	var tag = 1
	signal pinged
	func notify(x):
		return x

func read_nope(o):
	return o.nope

func disc0(s):
	s.disconnect()

func disc2(s, c):
	s.disconnect(c, 1)

func _initialize():
	var h = Holder.new()
	print("R ", read_nope(h))
	var s = h.pinged
	var c = h.notify
	disc0(s)
	disc2(s, c)
	print("Z ")
	quit()
