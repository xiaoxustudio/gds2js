extends SceneTree

func _initialize():
	var b = PackedByteArray([1, 2])
	var i = PackedInt32Array([7])
	print("r1 ", b is PackedByteArray, " ", b is PackedInt32Array, " ", b is Array, " ", b is Object, " ", b is Variant)
	print("r2 ", i is PackedInt32Array, " ", i is PackedStringArray, " ", i is PackedByteArray)
	var c = b as PackedByteArray
	print("r3 ", c, " ", c == b, " ", c.size())
	var v = 1
	print("r4 ", v is PackedByteArray, " ", v is int)
	print("r5 ", typeof(b), " ", (i as PackedInt32Array)[0], " ", (i as PackedInt32Array).size())
	quit()
