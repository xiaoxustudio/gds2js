extends SceneTree

func v2(p, tag):
	match p:
		Vector2(1, 2):
			print(tag, "arm")
		_:
			print(tag, "other")

func v2i(p, tag):
	match p:
		Vector2i(1, 2):
			print(tag, "arm")
		_:
			print(tag, "other")

func v3(p, tag):
	match p:
		Vector3(1, 2, 3):
			print(tag, "arm")
		_:
			print(tag, "other")

func v3i(p, tag):
	match p:
		Vector3i(1, 2, 3):
			print(tag, "arm")
		_:
			print(tag, "other")

func col(p, tag):
	match p:
		Color(1, 2, 3, 4):
			print(tag, "arm")
		_:
			print(tag, "other")

func snm(p, tag):
	match p:
		StringName("a"):
			print(tag, "arm")
		_:
			print(tag, "other")

func cal(p, tag):
	match p:
		Callable():
			print(tag, "arm")
		_:
			print(tag, "other")

func _initialize():
	v2(Vector2(1, 2), "t01|")
	v2(Vector2(1, 3), "t02|")
	v2(Vector2(1.0, 2.0), "t03|")
	v2("s", "t04|")
	v2(5, "t05|")
	v2(null, "t06|")
	v2(rid_from_int64(5), "t07|")
	v2i(Vector2i(1, 2), "t08|")
	v2i(Vector2i(1, 3), "t09|")
	v2i(Vector2(1, 2), "t10|")
	v2i(5, "t11|")
	v3(Vector3(1, 2, 3), "t12|")
	v3(Vector3(1, 2, 4), "t13|")
	v3(Vector3i(1, 2, 3), "t14|")
	v3("s", "t15|")
	v3i(Vector3i(1, 2, 3), "t16|")
	v3i(Vector3i(1, 2, 4), "t17|")
	v3i(null, "t18|")
	col(Color(1, 2, 3, 4), "t19|")
	col(Color(1, 2, 3, 5), "t20|")
	col(Vector2(1, 2), "t21|")
	col("s", "t22|")
	snm("a", "t23|")
	snm(&"a", "t24|")
	snm(StringName("a"), "t25|")
	snm("b", "t26|")
	snm(5, "t27|")
	cal(Callable(), "t28|")
	cal(^"a/b", "t29|")
	cal("s", "t30|")
	cal(5, "t31|")
	cal(null, "t32|")
	quit()
