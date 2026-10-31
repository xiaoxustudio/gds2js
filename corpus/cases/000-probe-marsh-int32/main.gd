extends SceneTree

func _initialize():
	var a := PackedInt32Array([-1, 2, 16777216, -2147483648])
	var b: PackedByteArray = Marshalls.int32_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_int32_array(b), "|", Marshalls.bytes_to_int32_array(b) == a)
	print("c|", Marshalls.uint32_array_to_bytes(PackedInt32Array([1])) , "|", Marshalls.bytes_to_uint32_array(b))
	quit()
