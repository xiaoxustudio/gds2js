extends SceneTree

func _initialize():
	var p := Projection()
	print("p|", p, "|", typeof(p), "|", p.x, "|", p.determinant())
	var q := Projection(Transform3D(Basis(), Vector3(1, 2, 3)))
	print("q|", q, "|", q.w)
	var d: Projection
	print("d|", d)
	var r := Projection(Vector4(1, 2, 3, 4), Vector4(5, 6, 7, 8), Vector4(9, 10, 11, 12), Vector4(13, 14, 15, 16))
	print("r|", r)
	quit()
