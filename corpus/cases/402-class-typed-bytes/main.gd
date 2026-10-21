extends SceneTree

func _initialize():
	var a = Array([null, null], TYPE_OBJECT, &"RefCounted", null)
	print("u1 ", var_to_bytes(a).hex_encode())
	var b = bytes_to_var(var_to_bytes(a))
	print("u2 ", b, " ", b.is_typed(), " ", b.get_typed_builtin(), " ", b.get_typed_class_name(), " ", typeof(b))
	print("u3 ", var_to_bytes(Array([], TYPE_OBJECT, &"Node", null)).hex_encode())
	print("u4 ", var_to_bytes(Array([], TYPE_OBJECT, &"", null)).hex_encode())
	var d = { "k": Array([null], TYPE_OBJECT, &"Resource", null) }
	print("u5 ", var_to_bytes(d).hex_encode())
	print("u6 ", var_to_bytes(Array([null], TYPE_STRING, &"", null)).hex_encode())
	var c = Array([1], TYPE_OBJECT, &"RefCounted", null)
	print("u7 ", c, " ", c.is_typed(), " ", c.get_typed_class_name(), " ", var_to_bytes(c).hex_encode())
	print("u8 ", Array([1, 2], TYPE_INT, &"Foo", null).is_typed(), " ", Array([1, 2], TYPE_INT, &"Foo", null))
	quit()
