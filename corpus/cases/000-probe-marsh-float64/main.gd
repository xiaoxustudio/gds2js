extends SceneTree

func _initialize():
	var a := PackedFloat64Array([1.5, -0.25, 1.7976931348623157e+308])
	var b: PackedByteArray = Marshalls.float64_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_float64_array(b), "|", Marshalls.bytes_to_float64_array(b) == a)
	quit()
