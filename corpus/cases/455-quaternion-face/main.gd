extends SceneTree

func _initialize():
	var i := Quaternion()
	var a := Quaternion(0.1, 0.2, 0.3, 0.9)
	var b := Quaternion(0, 0.7071068, 0, 0.7071068)
	var c := Quaternion(Vector3(0, 1, 0), 0.5)
	var d := Quaternion(Vector3(0, 1, 0), Vector3(1, 0, 0))
	print("u01|", str(i), "|", str(a), "|", str(b), "|", typeof(a))
	print("u02|", str(c), "|", str(d))
	print("u03|", a.x, "|", a.y, "|", a.z, "|", a.w)
	print("u04|", a.length(), "|", a.length_squared(), "|", b.length(), "|", b.length_squared())
	print("u05|", str(b.normalized()), "|", str(a.normalized()), "|", str(i.inverse()))
	print("u06|", str(a.get_axis()), "|", a.get_angle(), "|", a.dot(b))
	print("u07|", a == b, "|", a != b, "|", a.is_equal_approx(a), "|", b.is_equal_approx(a))
	print("u08|", var_to_str(a), "|", str_to_var(var_to_str(a)) == a, "|", var_to_bytes(a).size(), "|", bytes_to_var(var_to_bytes(a)) == a)
	var arr: Array[Quaternion] = [i, a]
	print("u09|", arr.size(), "|", arr[0] == i, "|", str(arr[1]))
	var kd := {a: 1}
	print("u10|", kd.size(), "|", kd.has(Quaternion(0.1, 0.2, 0.3, 0.9)), "|", kd[a])
	var z: Quaternion
	print("u11|", str(z), "|", z is Quaternion, "|", z.length_squared())
	quit()
