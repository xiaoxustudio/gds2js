extends SceneTree

func _initialize():
	var i := Transform3D()
	var b := Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10))
	var t := Transform3D(b, Vector3(11, 12, 13))
	var x := Transform3D(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10), Vector3(11, 12, 13))
	print("k01|", str(i), "|", str(t), "|", str(x), "|", typeof(t), "|", t == x)
	print("k02|", str(t.basis), "|", str(t.origin), "|", t.basis.x, "|", t.origin.z)
	var w := Transform3D()
	w.basis = b
	w.origin = Vector3(9, 8, 7)
	print("k03|", str(w), "|", str(w.basis.y))
	var u := Transform3D(Basis(Vector3(0.6, 0, 0), Vector3(0, 0.8, 0), Vector3(0, 0, 1)), Vector3(1, 2, 3))
	print("k04|", str(t * u), "|", str(u * t), "|", str(t * Vector3(1, 2, 3)), "|", str(Vector3(1, 2, 3) * t))
	print("k05|", str(t.affine_inverse()), "|", str(t.affine_inverse() * t == Transform3D()), "|", str(u.orthonormalized()))
	print("k06|", str(t.scaled(Vector3(2, 3, 4))), "|", str(t.translated(Vector3(10, 10, 10))))
	print("k07|", str(Transform3D().rotated(Vector3(0, 1, 0), -1.25)), "|", str(t.rotated(Vector3(0, 1, 0), 0.5)))
	print("k08|", str(u.basis), "|", u.is_finite(), "|", t == Transform3D(b, Vector3(11, 12, 13)), "|", str(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4))))
	var z: Transform3D
	print("k09|", str(z), "|", z is Transform3D, "|", z == Transform3D(), "|", str(z.basis), "|", str(z.origin))
	print("k10|", var_to_str(t), "|", str_to_var(var_to_str(t)) == t, "|", var_to_bytes(t), "|", bytes_to_var(var_to_bytes(t)) == t)
	var arr: Array[Transform3D] = [i, t]
	var d := {t: 1}
	print("k11|", arr.size(), "|", arr[0] == i, "|", d.has(Transform3D(b, Vector3(11, 12, 13))), "|", d[t])
	print("k12|", hash(t), "|", hash(u), "|", hash(t) == hash(Transform3D(b, Vector3(11, 12, 13))), "|", hash(t.basis), "|", hash(t.origin))
	print("k13|", str([t]), "|", str({t: 1}), "|", Transform3D(t) == t, "|", t == null, "|", t != null)
	quit()
