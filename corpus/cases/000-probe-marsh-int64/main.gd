extends SceneTree

func _initialize():
	var a := PackedInt64Array([-1, 2, 4294967296, -9223372036854775808])
	var b: PackedByteArray = Marshalls.int64_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_int64_array(b), "|", Marshalls.bytes_to_int64_array(b) == a)
	print("c|", Marshalls.bytes_to_uint64_array(b))
	quit()
