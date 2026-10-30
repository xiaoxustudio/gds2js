extends SceneTree

func _initialize():
	var b := PackedByteArray([1, 2, 3])
	print("a|", Marshalls.bytes_to_int16_array(b))
	print("b|", Marshalls.bytes_to_int32_array(b))
	print("c|", Marshalls.bytes_to_float64_array(b))
	print("d|", Marshalls.bytes_to_int8_array(b))
	quit()
