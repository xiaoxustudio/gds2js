extends SceneTree
func _initialize():
	var a := AABB(Vector3(1, 2, 3), Vector3(4, 5, 6))
	print("axis|", a.get_longest_axis_index(), "|", a.get_longest_axis_size(), "|", a.get_longest_axis(), "|", a.get_shortest_axis_index(), "|", a.get_shortest_axis_size(), "|", a.get_shortest_axis())
	print("support|", a.get_support(Vector3(1, 1, 1)), "|", a.get_support(Vector3(-1, 1, -1)))
	print("surface|", a.has_surface(), "|", AABB(Vector3(), Vector3(0, 1, 1)).has_surface())
	print("abs|", AABB(Vector3(1, 2, 3), Vector3(-1, -2, -3)).abs())
	print("grow|", a.grow(2))
	print("encl|", a.encloses(AABB(Vector3(2, 3, 4), Vector3(1, 1, 1))), "|", a.encloses(AABB(Vector3(0, 2, 3), Vector3(1, 1, 1))))
	print("inter|", a.intersection(AABB(Vector3(3, 4, 5), Vector3(3, 4, 5))))
	print("endpoint|", a.get_endpoint(0), "|", a.get_endpoint(3), "|", a.get_endpoint(7))
	quit()
