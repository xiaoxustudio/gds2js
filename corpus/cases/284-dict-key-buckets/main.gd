extends SceneTree

func _initialize():
	var d = {1: "int", 1.0: "float", 0.0: "zero", true: "bool", "a": "str", 0: "inti", false: "boolf", null: "nil", Vector2(1, 2): "vec"}
	print(d.size())
	for k in [1, 1.0, 0, false, true, null, "a", &"a", Vector2(1.0, 2.0), 2]:
		print(typeof(k), "|", d.has(k), "|", d.get(k, "-"))
	var nz = 0.0 * -1.0
	print(typeof(nz), "|", d.has(nz), "|", d[nz])
	print(d)
	quit()
