extends SceneTree

class Shape:
	var label := "shape"

	func describe() -> String:
		return "Shape<" + label + ">"

	func area() -> float:
		return 0.0

class Circle extends Shape:
	var radius := 1.0

	func _init(p_radius: float) -> void:
		radius = p_radius
		label = "circle"

	func area() -> float:
		return 3.14 * radius * radius

	func describe() -> String:
		return super.describe() + ":Circle " + str(radius)

signal answered(v)

func _initialize():
	# int / float 双轨：整除向零截断，越界才升 bigint
	print("num\t", 1 << 62, "\t", 7 / 2, " ", -7 / 2, "\t", 7.0 / 2.0)
	print("str\t", str(2), " ", str(2.0), " ", str(1 == 1.0))

	# 容器是引用语义，不是值拷贝
	var a = [1, 2, 3]
	var b = a
	b.append(4)
	print("arr\t", a, "\t", a.size(), " ", b[0])
	var d = {"k": [1]}
	d["k"].append(2)
	print("dict\t", d, "\t", d.has("k"))
	var t: Array[int] = [3, 1, 2]
	t.sort()
	print("typed\t", t, "\t", t.count(1))

	# String 是 UTF-32：长度和下标都数码点
	var s = "héllo wörld"
	print("utf\t", s.length(), "\t", s[1], " ", s.substr(6, 5), " ", s.to_upper())
	print("ops\t", s.split(" "), "\t", s.replace("l", "L"), "\t", s.find("lo"))
	print("cap\t", "hello world".capitalize(), "\t", "McDonald".capitalize())
	print("fmt\t", "%s=%d" % ["n", 42])

	# 类、继承与覆写
	var c = Circle.new(2.0)
	print("cls\t", c.describe(), "\t", c.area(), "\t", c is Shape, " ", c is Circle)

	# await 降级成 Promise：信号必须被 await，这是 Godot 自己的规则
	print("await\t", await answer(7))
	quit()

func answer(v):
	fire_answer.call_deferred(v)
	return await answered

func fire_answer(v):
	answered.emit(v)
