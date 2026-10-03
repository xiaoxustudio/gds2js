extends SceneTree

func each(label: String, f):
	var parts: Array[String] = []
	for x in f:
		parts.append(str(x))
	print(label + "\t[" + "][".join(parts) + "]\t" + str(parts.size()))

func counted(n: int) -> int:
	var total = 0
	for i in n:
		total += i
	return total

func counted_float(n: float) -> String:
	var out: Array[String] = []
	for i in n:
		out.append(str(i))
	return "|".join(out)

func nested() -> String:
	var out: Array[String] = []
	for i in 2:
		for j in 2:
			out.append(str(i) + str(j))
	return ",".join(out)

func typed_loop_var() -> String:
	var out: Array[String] = []
	for i: int in 3:
		out.append(str(i))
	return ",".join(out)

func _collect(n) -> Array:
	var out: Array = []
	for i in n:
		out.append(i)
	return out

func _initialize():
	each("int-5", 5)
	each("int-0", 0)
	each("int-1", 1)
	each("int-neg", -3)
	each("float-2", 2.0)
	each("float-0.5", 0.5)
	each("float-neg", -1.0)
	each("str-ab", "ab")
	each("str-empty", "")
	each("str-utf", "é😀a")
	each("dict", {"a": 1, "b": 2})
	each("dict-empty", {})
	each("array", [7, 8, 9])
	each("array-empty", [])
	each("pack-byte", PackedByteArray([9, 8]))
	each("pack-str", PackedStringArray(["x", "y"]))
	each("nested-array", [[1, 2], [3]])
	print("counted\t" + str(counted(5)) + "\t" + str(counted(0)) + "\t" + str(counted(-2)))
	print("counted-f\t" + counted_float(3.0) + "\t" + counted_float(0.0))
	print("nested\t" + nested())
	print("typed\t" + typed_loop_var())
	print("range-parity\t" + str(range(4)) + "\t" + str(_collect(4)) + "\t" + str(_collect(0)))
	quit()
