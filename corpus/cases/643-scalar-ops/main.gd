extends SceneTree

func _initialize():
	var q := Quaternion(1, 2, 3, 4)
	var r := Quaternion(0.5, -1, 2, 0.25)
	print("q1|", q + r, "|", q - r, "|", -q)
	print("q2|", q * 2, "|", 2 * q, "|", q * 0.5, "|", q / 2, "|", q / 0.5)
	print("b1|", Basis(Vector3(0, 0, 1), 0.5) / 2, "|", Basis(Vector3(0, 1, 0), 0.25) / 2.5)
	print("t1|", Transform2D(0.5, Vector2(1, 2)) * 2, "|", Transform2D(0.5, Vector2(1, 2)) / 2)
	print("t2|", Transform3D(Basis(Vector3(0, 0, 1), 0.5), Vector3(1, 2, 3)) * 2)
	print("t3|", Transform3D(Basis(Vector3(0, 0, 1), 0.5), Vector3(1, 2, 3)) / 2)
	print("u1|", +Vector2(1, 2), "|", +Vector2i(1, 2), "|", +Vector3(1, 2, 3), "|", +Vector3i(1, 2, 3))
	print("u2|", +Vector4(1, 2, 3, 4), "|", +Vector4i(1, 2, 3, 4), "|", +Color(0.1, 0.2, 0.3, 0.4))
	print("u3|", +Plane(1, 2, 3, 4), "|", +Quaternion(1, 2, 3, 4))
	quit()
