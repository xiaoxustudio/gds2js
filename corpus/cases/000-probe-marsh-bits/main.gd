extends SceneTree

func _initialize():
	print("a|", Marshalls.bool_to_bit(true), "|", Marshalls.bool_to_bit(false), "|", typeof(Marshalls.bool_to_bit(true)))
	print("b|", Marshalls.bytes_to_bits(PackedByteArray([1, 2])))
	print("c|", Marshalls.bytes_to_bits(PackedByteArray([0, 127, 128, 255])))
	quit()
