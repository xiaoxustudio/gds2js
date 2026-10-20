extends SceneTree

func _initialize():
	var a: Array[RefCounted] = []
	print("u1 ", a, " ", a.is_typed(), " ", a.get_typed_builtin(), " ", a.get_typed_class_name(), " ", typeof(a))
	var b: Array[Object] = []
	print("u2 ", b.is_typed(), " ", b.get_typed_builtin(), " ", b.get_typed_class_name())
	var c: Array[Node] = []
	print("u3 ", c.is_typed(), " ", c.get_typed_builtin(), " ", c.get_typed_class_name(), " ", c.size())
	var d: Array[RefCounted]
	print("u4 ", d, " ", d.is_typed(), " ", d.size(), " ", d.get_typed_builtin())
	var e: Array[RefCounted] = [null]
	print("u5 ", e, " ", e.is_typed(), " ", e.size())
	var f: Array[RefCounted] = []
	f.append(null)
	print("u6 ", f.size(), " ", str(f), " ", f.is_typed())
	var m: Array[RefCounted] = Array([], TYPE_OBJECT, &"RefCounted", null)
	print("u7 ", m.is_typed(), " ", m.get_typed_class_name(), " ", m.size())
	var n: Array[RefCounted] = []
	n.append(1)
	print("u8 ", n.size(), " ", var_to_bytes(n).hex_encode())
	quit()
