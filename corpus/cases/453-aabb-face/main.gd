extends SceneTree

func _initialize():
	var a0 := AABB()
	var a1 := AABB(Vector3(0, 0, 0), Vector3(1, 2, 3))
	print("s01|", str(a0), "|", str(a1), "|", typeof(a1))
	print("s02|", a1.position, "|", a1.size, "|", a1.end, "|", a1.get_volume(), "|", a1.has_volume(), "|", a0.has_volume())
	print("s03|", str(a1.get_center()), "|", str(AABB(Vector3(1, 2, 3), Vector3(4, 5, 6)).get_center()))
	print("s04|", a1.has_point(Vector3(0.5, 1, 1.5)), "|", a1.has_point(Vector3(1, 2, 3)), "|", a1.has_point(Vector3(1.1, 1, 1)))
	print("s05|", a1.intersects(AABB(Vector3(0, 0, 0), Vector3(1, 2, 3))), "|", a1.intersects(AABB(Vector3(0.5, 1, 1.5), Vector3(1, 1, 1))), "|", a1.intersects(AABB(Vector3(5, 5, 5), Vector3(1, 1, 1))))
	print("s06|", str(a1.merge(AABB(Vector3(2, 3, 4), Vector3(1, 1, 1)))), "|", str(a1.expand(Vector3(5, 5, 5))), "|", str(a1.expand(Vector3(-1, -1, -1))))
	print("s07|", a1 == AABB(Vector3(0, 0, 0), Vector3(1, 2, 3)), "|", a1 != a0, "|", a1.is_equal_approx(AABB(Vector3(0, 0, 0), Vector3(1, 2, 3))), "|", hash(a1) == hash(AABB(Vector3(0, 0, 0), Vector3(1, 2, 3))))
	print("s08|", var_to_str(a1), "|", str_to_var(var_to_str(a1)) == a1, "|", var_to_bytes(a1).size(), "|", bytes_to_var(var_to_bytes(a1)) == a1)
	var arr: Array[AABB] = [a0, a1]
	print("s09|", arr.size(), "|", arr[1] == a1, "|", str(arr[0]))
	var d := {a1: 1}
	print("s10|", d.size(), "|", d.has(AABB(Vector3(0, 0, 0), Vector3(1, 2, 3))), "|", d[a1])
	var z: AABB
	print("s11|", str(z), "|", z is AABB, "|", a1.is_finite())
	quit()
