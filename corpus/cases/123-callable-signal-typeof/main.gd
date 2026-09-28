extends SceneTree

signal fired(x)


class Box:
	signal boxed

	var n: int = 1


func ifn():
	return 7


func _initialize():
	var b = Box.new()
	var cb = ifn
	var sig = fired
	print("u1 ", typeof(cb))
	print("u2 ", typeof(ifn))
	print("u3 ", typeof(sig))
	print("u4 ", typeof(fired))
	print("u5 ", typeof(b.boxed))
	print("u6 ", cb.call())
	print("u7 ", typeof(b.n))
	print("u8 ", typeof(Box.new().boxed))
	quit()
