extends SceneTree

func _initialize():
	var b: PackedByteArray = Marshalls.bits_to_bytes("1000000001000000")
	print("a|", b, "|", typeof(b))
	print("b|", Marshalls.bits_to_bytes(""), "|", Marshalls.bits_to_bytes("1"), "|", Marshalls.bits_to_bytes("01"))
	print("c|", Marshalls.bytes_to_bits(Marshalls.bits_to_bytes("1000000010000000")))
	quit()
