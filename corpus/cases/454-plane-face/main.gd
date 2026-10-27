extends SceneTree

func _initialize():
	var p0 := Plane()
	var p1 := Plane(Vector3(0, 1, 0), 1.5)
	var p2 := Plane(0, 1, 0, 1.5)
	var p3 := Plane(Vector3(0, 1, 0), Vector3(1, 1, 0), Vector3(0, 0, 1))
	print("t01|", str(p0), "|", str(p1), "|", str(p2), "|", typeof(p1))
	print("t02|", p1.normal, "|", p1.d, "|", str(p3))
	print("t03|", p1.distance_to(Vector3(0, 2, 0)), "|", p1.distance_to(Vector3(0, 0, 0)), "|", p1.has_point(Vector3(0, 1.5, 0)), "|", p1.has_point(Vector3(0, 1, 0)))
	print("t04|", str(p1.intersects_ray(Vector3(0, 0, 0), Vector3(0, 2, 0))) , "|", str(p1.normalized()))
	print("t05|", p1 == p2, "|", p1 == p0, "|", p1.is_equal_approx(p2), "|", hash(p1) == hash(p2))
	print("t06|", var_to_str(p1), "|", str_to_var(var_to_str(p1)) == p1, "|", var_to_bytes(p1).size(), "|", bytes_to_var(var_to_bytes(p1)) == p1)
	var arr: Array[Plane] = [p0, p1]
	print("t07|", arr.size(), "|", arr[1] == p1, "|", str(arr[0]))
	var d := {p1: 1}
	print("t08|", d.size(), "|", d.has(Plane(0, 1, 0, 1.5)), "|", d[p1])
	var z: Plane
	print("t09|", str(z), "|", z is Plane, "|", p1 != p0)
	quit()
