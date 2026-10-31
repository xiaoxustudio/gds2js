extends SceneTree

func _initialize():
	var a := PackedFloat32Array([1.5, -0.25, 0.0, 3.4028234663852886e+38])
	var b: PackedByteArray = Marshalls.float32_array_to_bytes(a)
	print("a|", b, "|", b.size())
	print("b|", Marshalls.bytes_to_float32_array(b), "|", Marshalls.bytes_to_float32_array(b) == a)
	quit()
