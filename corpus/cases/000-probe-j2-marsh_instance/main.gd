extends SceneTree

func _initialize():
	var m := Marshalls.new()
	print("a|", m.bool_to_bit(true), "|", m.bytes_to_bits(PackedByteArray([1, 2])))
	quit()
