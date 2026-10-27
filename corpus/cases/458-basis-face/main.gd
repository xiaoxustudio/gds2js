extends SceneTree

func _initialize():
	var b0 := Basis()
	var b1 := Basis(Vector3(1, 2, 3), Vector3(4, 5, 6), Vector3(7, 8, 10))
	var b2 := Basis(Vector3(0, 1, 0), PI / 2.0)
	print("k01|", str(b0), "|", str(b1), "|", str(b2), "|", typeof(b1))
	print("k02|", b1.x, "|", b1.y, "|", b1.z, "|", str(Basis(b1)))
	var bb := Basis()
	bb.x = Vector3(9, 9, 9)
	bb.z = Vector3(0, 0, 4)
	print("k03|", str(bb), "|", str(Basis(Vector3(0, 1, 0), 1.0)))
	var q90 := Basis(Quaternion(0, 0.7071068, 0, 0.7071068))
	var q111 := Basis(Quaternion(1, 1, 1, 1))
	var qs := Basis(Quaternion(0.1, 0.2, 0.3, 0.4))
	print("k04|", str(q90), "|", str(q111))
	print("k05|", var_to_str(qs), "|", str(q90 * q111))
	print("k06|", b1 == b1, "|", b1 == b0, "|", b1 != b0, "|", b1 == null)
	print("k07|", b1.determinant(), "|", b0.determinant(), "|", str(b1.transposed()))
	print("k08|", str(b1.inverse()), "|", var_to_str(b1.inverse()))
	print("k09|", str(b1.inverse() * b1), "|", str(b1.get_scale()), "|", str(b0.get_scale()))
	print("k10|", str(q90.rotated(Vector3(0, 1, 0), 1.0)), "|", str(q90.rotated(Vector3(0, 1, 0), 1.0).rotated(Vector3(0, 1, 0), 1.0)))
	var bx := Basis(Vector3(0, 1, 0), Vector3(1, 0, 0), Vector3(0, 0, 2))
	print("k11|", str(b1 * bx), "|", str(bx * b1))
	print("k12|", b1 * Vector3(1, 1, 1), "|", b1 * Vector3(0.5, 0.25, 1.0), "|", str(b1 * 0.5))
	print("k13|", str(b1 * 2), "|", str(b1 * 2.0), "|", b1.tdotx(Vector3(0.5, 0.25, 1.25)), "|", b1.tdoty(Vector3(1, 0, 0)), "|", b1.tdotz(Vector3(0, 1, 0)))
	print("k14|", hash(b1), "|", hash(b0), "|", hash(qs), "|", hash(qs * qs), "|", hash(Basis(Vector3(0, 1, 0), 1.0)))
	print("k15|", var_to_str(b1), "|", str_to_var(var_to_str(b1)) == b1, "|", var_to_bytes(b1).size(), "|", var_to_bytes(b1))
	var arr: Array[Basis] = [b1, b0]
	var d := {b1: 1}
	print("k16|", str(arr), "|", d[b1], "|", arr.size())
	var db: Basis
	print("k17|", str(db), "|", db == Basis(), "|", typeof(db))
	quit()
