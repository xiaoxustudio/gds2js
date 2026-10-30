extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10)), Vector3(11, 12, 13))
	print("a|", var_to_str(t))
	print("b|", var_to_bytes(t))
	print("c|", bytes_to_var(var_to_bytes(t)) == t, "|", str_to_var(var_to_str(t)) == t)
	quit()
