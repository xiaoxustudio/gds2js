extends SceneTree

func _initialize():
	var a := PackedInt8Array([-1, 2, 127, -128])
	var b: PackedByteArray = Marshalls.int8_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_int8_array(b), "|", Marshalls.bytes_to_int8_array(b) == a)
	print("c|", Marshalls.uint8_array_to_bytes(PackedByteArray([0, 255])), "|", Marshalls.bytes_to_uint8_array(b))
	quit()
