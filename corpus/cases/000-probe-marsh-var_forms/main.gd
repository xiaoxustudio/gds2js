extends SceneTree

func _initialize():
	print("a|", Marshalls.var_to_bytes(5), "|", var_to_bytes(5), "|", Marshalls.var_to_bytes(5) == var_to_bytes(5))
	print("b|", Marshalls.bytes_to_var(Marshalls.var_to_bytes([1, {"a": 2}])), "|", bytes_to_var(var_to_bytes(1.5)))
	print("c|", Marshalls.var_to_bytes_with_objects(null), "|", Marshalls.bytes_to_var_with_objects(Marshalls.var_to_bytes_with_objects(5)))
	print("d|", Marshalls.var_to_bytes(1.5), "|", Marshalls.var_to_bytes("s"), "|", Marshalls.var_to_bytes(true))
	print("e|", Marshalls.bytes_to_var(PackedByteArray([1, 2, 3])))
	quit()
