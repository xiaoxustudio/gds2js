extends SceneTree

func _initialize():
	var b = PackedByteArray([104, 101, 108, 108, 111])
	print("Y1|", b.hex_encode, " ", b.hex_encode.call())
	print("Y2|", b.get_string_from_utf8, " ", b.get_string_from_utf8.call())
	print("Y3|", b.compress, " ", b.decompress, " ", b.get_string_from_utf16, " ", b.get_string_from_wchar)
	print("Y4|", b.to_int32_array, " ", b.to_int64_array, " ", b.to_float32_array, " ", b.to_float64_array)
	print("Y5|", b.get_string_from_ascii, " ", b.get_string_from_ascii.call())
	var f = PackedByteArray([1, 0, 0, 0])
	print("Y6|", f.to_int32_array.call())
	print("Y7|", b.hex_encode.get_argument_count(), " ", b.compress.get_argument_count(), " ", b.decompress.get_argument_count())
	quit()
