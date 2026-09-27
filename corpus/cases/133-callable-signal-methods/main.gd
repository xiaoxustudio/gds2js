extends SceneTree

signal fired(x)


class A:
	func im(v):
		return v * 2

	static func sm(v):
		return v


func top(v):
	return v


func _initialize():
	var a = A.new()
	var cb = a.im
	print("u1 ", typeof(top), " ", typeof(a.im), " ", typeof(A.sm), " ", typeof(fired))
	print("u2 ", top.is_null(), " ", a.im.is_null(), " ", fired.is_null())
	print("u3 ", top.is_valid(), " ", a.im.is_valid())
	print("u4 ", top.get_method(), " | ", a.im.get_method(), " | ", A.sm.get_method())
	print("u5 ", top.call(5), " ", top.callv([6]))
	print("u6 ", cb.call(21), " ", cb.callv([5]))
	print("u7 ", fired.get_name())
	print("u8 ", A.sm.call(9))
	print("u9 ", cb.is_null(), " ", cb.get_method())
	quit()
