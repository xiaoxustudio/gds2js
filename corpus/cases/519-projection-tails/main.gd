extends SceneTree
func _initialize():
	var p := Projection(Vector4(1, 0, 0, 0), Vector4(0, 2, 0, 0), Vector4(0, 0, 3, 1), Vector4(0, 0, 0, 1))
	print("inv|", p.inverse())
	print("flip|", p.flipped_y())
	print("orth|", p.is_orthogonal(), "|", Projection().is_orthogonal())
	print("asp|", p.get_aspect())
	quit()
