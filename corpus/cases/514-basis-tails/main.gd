extends SceneTree
func _initialize():
	var b := Basis(Vector3(0.5, 0.2, 0.1), Vector3(-0.3, 1.2, 0.4), Vector3(0.2, -0.5, 1.5))
	print("conf|", b.is_conformal(), "|", b.is_equal_approx(b), "|", b.is_finite())
	print("orth|", b.orthonormalized())
	print("scaled|", b.scaled(Vector3(2, 3, 4)))
	print("scaledl|", b.scaled_local(Vector3(2, 3, 4)))
	quit()
