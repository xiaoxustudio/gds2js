extends SceneTree

func _initialize():
	var big = 9223372036854775807
	print("a|", big, "|", big + 1, "|", big * 2)
	print("b|", -9223372036854775807 - 1, "|", (-9223372036854775807 - 1) * -1)
	print("c|", 9223372036854775807 + 9223372036854775807)
	print("d|", big / 3, "|", big % 1000000007, "|", big >> 1)
	print("e|", float(big), "|", int(float(big)))
	print("f|", "9223372036854775807".to_int(), "|", "0x7FFFFFFFFFFFFFFF".hex_to_int(), "|", "-9223372036854775808".to_int())
	print("g|", 1 << 62, "|", 1 << 63, "|", (1 << 63) - 1)
	print("h|", big == 9223372036854775806 + 1, "|", big > 9223372036854775806)
	print("i|", -7 / 2, "|", -7 % 2, "|", 7 % -2)
	quit()
