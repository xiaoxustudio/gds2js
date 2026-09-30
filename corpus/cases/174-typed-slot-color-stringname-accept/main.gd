extends SceneTree

var fd_int: int = 2.7
var fd_float: float = 3
var fd_color: Color = 255
var fd_vec2i: Vector2i = Vector2(1.7, 2.9)
var fd_name: StringName = "nm"

func _initialize():
	print("r ", fd_int, " ", fd_float, " ", fd_color, " ", fd_vec2i, " ", typeof(fd_name), " ", fd_name)
	var c: Color = 123456789
	print("c ", c, " ", typeof(c))
	c = "abc"
	print("c2 ", c)
	var n: StringName = "zz"
	print("n ", typeof(n), " ", n)
	var a: Array[Color] = [1, "f00"]
	a.append(65280)
	a[0] = 4294967295
	print("a ", a, " ", typeof(a[1]))
	var d: Dictionary[StringName, Color] = { "k": 5 }
	print("d ", d, " ", typeof(d.keys()[0]), " ", typeof(d["k"]))
	var s: String = &"abc"
	print("s ", s, " ", typeof(s))
	var arr: Array[String] = [&"abc"]
	print("arr ", arr, " ", typeof(arr[0]))
	quit()
