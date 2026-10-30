extends SceneTree

func _initialize():
	print("a|", bool_to_bit(true), "|", bytes_to_bits(PackedByteArray([1, 2])), "|", bits_to_bytes("1000000001000000"))
	quit()
