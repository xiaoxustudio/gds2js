extends SceneTree

var mi: Array[int] = []

func _initialize():
	var u: Array[int] = [1]
	var alias: Array[int] = u
	u[0] = 7
	print("A=", alias)
	var lit: Array[int] = [2]
	lit = [3, 4]
	print("B=", lit)
	var d: Dictionary[int, String] = {1: "a"}
	d = {2: "b"}
	print("C=", d)
	print("D=", retLit(), retThrough())
	mi = u
	print("E=", mi)
	var w: Variant = u
	var to: Array[int] = w
	print("F=", to, " ", to.is_typed())
	var sd: Dictionary[int, String] = {1: "x"}
	var wd: Variant = sd
	var td: Dictionary[int, String] = wd
	print("G=", td, " ", td.is_typed())
	quit()

func retLit() -> Array[int]:
	return [9]

func retThrough() -> Array[String]:
	var conv: Array[String] = ["s"]
	var through: Variant = conv
	return through
