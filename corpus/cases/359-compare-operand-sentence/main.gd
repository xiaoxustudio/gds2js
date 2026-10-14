extends SceneTree

# 实测：装箱比较的运行期拒句子四形同文，形名走引擎的拼法（null 叫 Nil、pack 叫本名、Color 互比也拒）。
func w0():
	var x: Variant = null
	var y: Variant = 1
	print(x < y)

func w1():
	var x: Variant = PackedStringArray(["a"])
	var y: Variant = 1
	print(x < y)

func w2():
	var x: Variant = {"a": 1}
	var y: Variant = 1
	print(x > y)

func w3():
	var x: Variant = Color(1, 0, 0, 1)
	var y: Variant = Color(0, 1, 0, 1)
	print(x < y)

func w4():
	var x: Variant = 1
	var y: Variant = 1.5
	print(x < y)
	print("末格给值")

func _initialize():
	w0()
	w1()
	w2()
	w3()
	w4()
	quit()
