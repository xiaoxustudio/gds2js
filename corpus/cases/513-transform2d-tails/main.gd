extends SceneTree
func _initialize():
	var t := Transform2D(Vector2(0.5, 0.2), Vector2(-0.3, 1.2), Vector2(4, 5))
	print("bx|", t.basis_xform(Vector2(1, 2)), "|", t.basis_xform_inv(Vector2(1, 2)))
	print("org|", t.get_origin(), "|", t.get_skew())
	print("inv|", t.inverse())
	print("orth|", t.orthonormalized())
	print("eq|", t.is_equal_approx(Transform2D(Vector2(0.5, 0.2), Vector2(-0.3, 1.2), Vector2(4, 5))), "|", t.is_finite())
	print("rl|", t.rotated_local(0.5))
	print("sl|", t.scaled_local(Vector2(2, 3)))
	print("tl|", t.translated_local(Vector2(1, 2)))
	quit()
