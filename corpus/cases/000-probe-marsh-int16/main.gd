extends SceneTree

func _initialize():
	var a := PackedInt16Array([-1, 258, 32767, -32768])
	var b: PackedByteArray = Marshalls.int16_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_int16_array(b), "|", Marshalls.bytes_to_int16_array(b) == a)
	print("c|", Marshalls.uint16_array_to_bytes(PackedInt16Array([65535])), "|", Marshalls.bytes_to_uint16_array(b))
	quit()
