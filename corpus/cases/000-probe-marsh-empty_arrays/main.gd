extends SceneTree

func _initialize():
	print("a|", Marshalls.int32_array_to_bytes(PackedInt32Array([])), "|", Marshalls.bytes_to_int32_array(PackedByteArray([])))
	print("b|", Marshalls.bytes_to_bits(PackedByteArray([])), "|", Marshalls.int64_array_to_bytes(PackedInt64Array([0])))
	quit()
