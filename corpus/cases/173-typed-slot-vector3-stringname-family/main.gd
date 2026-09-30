extends SceneTree

func take_v3(v: Vector3):
	print("v3 ", typeof(v), " ", v)

func take_v3i(v: Vector3i):
	print("v3i ", typeof(v), " ", v)

func take_name(n: StringName):
	print("name ", typeof(n), " ", n)

func _initialize():
	var a = Vector3i(1, 2, 3)
	var b = Vector3(1.7, -2.9, 3.1)
	var s = "nm"
	take_v3(a)
	take_v3(b)
	take_v3i(b)
	take_v3i(a)
	take_name(s)
	take_name(&"lit")
	print("t ", Color(123456789), " ", a, " ", b, " ", typeof(&"x"))
	quit()
