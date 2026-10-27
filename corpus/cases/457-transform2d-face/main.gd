extends SceneTree

func _initialize():
	var i := Transform2D()
	var t := Transform2D(Vector2(1, 0), Vector2(0, 1), Vector2(3, 4))
	var r := Transform2D(0.5, Vector2(1, 2))
	print("k01|", str(i), "|", str(t), "|", str(r), "|", typeof(t))
	print("k02|", t.x, "|", t.y, "|", t.origin, "|", str(Transform2D(r.x, r.y, r.origin)))
	print("k03|", t.determinant(), "|", r.determinant(), "|", t.get_rotation(), "|", str(t.get_scale()))
	print("k04|", str(t.affine_inverse()), "|", str(r.affine_inverse() * r))
	print("k05|", str(t * Vector2(1, 2)), "|", str(r * Vector2(1, 2)))
	print("k06|", str(t * r), "|", str(r * t), "|", str(i * t), "|", str(t * i))
	print("k07|", str(t.translated(Vector2(1, 1))), "|", str(t.rotated(0.5)), "|", str(t.scaled(Vector2(2, 2))))
	print("k08|", str(Transform2D()), "|", str(Transform2D(0, Vector2(0, 0))), "|", t == Transform2D(Vector2(1,0), Vector2(0,1), Vector2(3,4)))
	print("k09|", var_to_str(t), "|", str_to_var(var_to_str(t)) == t, "|", var_to_bytes(t), "|", bytes_to_var(var_to_bytes(t)) == t)
	var arr: Array[Transform2D] = [i, t]
	var d := {t: 1}
	print("k10|", arr.size(), "|", arr[0] == i, "|", d.has(Transform2D(Vector2(1,0), Vector2(0,1), Vector2(3,4))), "|", d[t])
	var z: Transform2D
	print("k11|", str(z), "|", z is Transform2D, "|", t.is_conformal(), "|", hash(t) == hash(Transform2D(Vector2(1,0), Vector2(0,1), Vector2(3,4))))
	quit()
