extends SceneTree

# 实测：装箱 bool 的 `<` / `>` 合式（false 在前），`<=` / `>=` 才是拒（静态已知的两支在解析期就拒，见 §6 第 56 条）。
func cmp(a: bool, b: bool):
	print(a, " < ", b, " → ", a < b, " | ", a, " > ", b, " → ", a > b)

func _initialize():
	print("A|", false < true, "|", true < false, "|", false > true, "|", true > false)
	var v: Variant = false
	var w: Variant = true
	print("B|", v < w, "|", w > v)
	var x: Array = [true, false]
	print("C|", x.min(), "|", x.max(), "|", [false, true].bsearch(true), "|", [false, true].bsearch(false))
	print("D|", [false, true].bsearch(true, false), "|", [true, false].bsearch(true), "|", [1, 2].bsearch(true))
	x.sort_custom(func(a, b): return a < b)
	print("E|", x)
	cmp(false, true)
	cmp(true, false)
	quit()
