extends SceneTree

func enc(tag, v):
	print(tag, "|", var_to_bytes(v), "|", bytes_to_var(var_to_bytes(v)))

func _initialize():
	var ai: Array[int] = [1, 2]
	var af: Array[float] = [1.5]
	var ab: Array[bool] = [true]
	var av: Array[Vector2] = [Vector2(1, 2)]
	var aa: Array[Array] = [[1]]
	var ae: Array[int] = []
	var di: Dictionary[String, int] = { "a": 1 }
	var av2i: Array[Vector2i] = [Vector2i(1, -2)]
	var acol: Array[Color] = [Color(0.25, 0.5, 0.75, 1)]
	var asn: Array[StringName] = [&"a"]
	var av3: Array[Vector3] = [Vector3(1, 2, 3)]
	var adic: Array[Dictionary] = [{ "a": 1 }]
	var av3i: Array[Vector3i] = [Vector3i(1, 2, 3)]
	var zero = 0.0
	enc("t01|", PackedInt32Array([1, -2]))
	enc("t02|", PackedInt64Array([1, -2]))
	enc("t03|", PackedFloat32Array([1.5, -2.5]))
	enc("t04|", PackedStringArray(["a", "abc"]))
	enc("t05|", PackedVector2Array([Vector2(1, 2)]))
	enc("t06|", PackedVector3Array([Vector3(1, 2, 3)]))
	enc("t07|", PackedColorArray([Color(0.25, 0.5, 0.75, 1)]))
	enc("t08|", PackedInt32Array([]))
	enc("t09|", PackedStringArray(["é"]))
	enc("t10|", NAN)
	enc("t11|", INF)
	enc("t12|", -INF)
	enc("t13|", 2.0 ** -1022)
	enc("t14|", 2.0 ** -1074)
	enc("t15|", -zero)
	enc("t16|", 0.1)
	enc("t17|", PI)
	enc("t18|", 1e20)
	enc("t19|", 1e-4)
	enc("t20|", 2.0 ** -126)
	enc("t21|", 16777216.0)
	enc("t22|", 16777217.0)
	enc("t43|", 2.0 ** -149)
	enc("t44|", 2.0 ** -127)
	enc("t45|", 2.0 ** -1075)
	enc("t46|", float(0))
	enc("t23|", ai)
	enc("t24|", af)
	enc("t25|", ab)
	enc("t26|", av)
	enc("t27|", aa)
	enc("t28|", ae)
	enc("t29|", di)
	enc("t30|", ^"a/b")
	enc("t31|", ^"a:1")
	enc("t32|", ^"a/b:0")
	enc("t33|", ^"/a")
	enc("t34|", ^"/a/b")
	enc("t35|", ^":1")
	enc("t36|", ^"a:1:2")
	enc("t37|", ^"a/b^c/d")
	enc("t38|", ^"sub:1^")
	enc("t39|", ^"")
	enc("t40|", ^"^")
	enc("t41|", ^"/:0")
	enc("t42|", ^"a/b/c:1:2")
	enc("t47|", Vector3i(1, -2, 3))
	enc("t48|", av2i)
	enc("t49|", acol)
	enc("t50|", asn)
	enc("t51|", av3)
	enc("t52|", adic)
	enc("t53|", av3i)
	quit()
