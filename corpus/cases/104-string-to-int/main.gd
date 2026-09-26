extends SceneTree

func _initialize():
	var sn: StringName = &"ff"
	var sn2: StringName = &"42"
	var sn3: StringName = &"0x10"
	print("n1 ", ("42").to_int(), " | ", ("-42").to_int(), " | ", ("+42").to_int(), " | ", (" 42 ").to_int(), " | ", ("42abc").to_int())
	print("n2 ", ("0x10").to_int(), " | ", ("1_000").to_int(), " | ", ("1.5").to_int(), " | ", ("1e5").to_int(), " | ", ("abc").to_int(), " | ", ("").to_int())
	print("n3 ", ("9223372036854775807").to_int(), " | ", ("9223372036854775808").to_int(), " | ", ("-9223372036854775809").to_int())
	print("n4 ", ("-0x10").to_int(), " | ", ("+ff").to_int(), " | ", ("f f").to_int(), " | ", ("0b101").to_int(), " | ", ("x1f").to_int(), " | ", ("1x2").to_int())
	print("n5 ", ("42").is_valid_int(), " | ", ("+42").is_valid_int(), " | ", ("007").is_valid_int(), " | ", ("9223372036854775808").is_valid_int())
	print("n6 ", (" 42 ").is_valid_int(), " | ", ("0x10").is_valid_int(), " | ", ("1_000").is_valid_int(), " | ", ("1.5").is_valid_int(), " | ", ("").is_valid_int(), " | ", ("-").is_valid_int())
	print("n7 ", ("ff").hex_to_int(), " | ", ("FF").hex_to_int(), " | ", ("0x10").hex_to_int(), " | ", ("1f").hex_to_int(), " | ", ("abc").hex_to_int())
	print("n8 ", ("-ff").hex_to_int(), " | ", ("1e5").hex_to_int(), " | ", ("0X1f").hex_to_int(), " | ", ("ff00").hex_to_int(), " | ", ("0b101").hex_to_int())
	print("n10 ", ("ff").is_valid_hex_number(), " | ", ("0x10").is_valid_hex_number(), " | ", ("-ff").is_valid_hex_number(), " | ", ("1e5").is_valid_hex_number(), " | ", ("zz").is_valid_hex_number(), " | ", ("").is_valid_hex_number())
	print("n11 ", ("0x10").is_valid_hex_number(true), " | ", ("-ff").is_valid_hex_number(true), " | ", ("ff").is_valid_hex_number(true), " | ", ("0X1f").is_valid_hex_number(true))
	print("n12 ", int("1e5"), " | ", ("1e5").to_int(), " | ", int("0b101"), " | ", ("0b101").to_int())
	print("n13 ", ("a-5").to_int(), " | ", ("a--5").to_int(), " | ", ("-a-2").to_int(), " | ", ("+ -3").to_int(), " | ", ("5-3").to_int(), " | ", ("1--2").to_int())
	print("n14 ", ("--5").to_int(), " | ", ("---5").to_int(), " | ", ("+-5").to_int(), " | ", ("-+5").to_int(), " | ", ("- 5").to_int(), " | ", ("-- 5").to_int(), " | ", ("--1.9").to_int())
	print("n15 ", (".-5").to_int(), " | ", ("x.5").to_int(), " | ", ("-1.5x2").to_int(), " | ", ("1.5.6").to_int(), " | ", ("1 .5").to_int(), " | ", ("1.-5").to_int())
	print("n16 ", ("9500000000000000009").to_int(), " | ", ("9999999999999999991").to_int(), " | ", ("9223372036854775811").to_int(), " | ", ("9223372036854775801").to_int())
	print("n17 ", ("0000000000000000000042").to_int(), " | ", ("9223372036854775808").to_int(), " | ", ("-9223372036854775808").to_int())
	print("n18 ", ("7fffffffffffffff").hex_to_int(), " | ", ("-0x8000000000000000").hex_to_int(), " | ", ("0x0").hex_to_int(), " | ", ("0x1f").hex_to_int())
	print("n19 ", ("-0x7fffffffffffffff").hex_to_int(), " | ", ("0").hex_to_int(), " | ", ("-0").hex_to_int(), " | ", ("-0x10").hex_to_int(), " | ", ("-0x1f").hex_to_int())
	print("n20 ", ("+ff").is_valid_hex_number(), " | ", ("+1").is_valid_hex_number(), " | ", ("--ff").is_valid_hex_number(), " | ", ("++ff").is_valid_hex_number(), " | ", (" ff").is_valid_hex_number(), " | ", ("-1.5").is_valid_hex_number())
	print("n21 ", ("-0x10").is_valid_hex_number(true), " | ", ("+0x10").is_valid_hex_number(true), " | ", ("-0X10").is_valid_hex_number(true), " | ", ("+-0x10").is_valid_hex_number(true), " | ", (" 0x10").is_valid_hex_number(true), " | ", ("0x0").is_valid_hex_number(true))
	print("n22 ", ("+-5").is_valid_int(), " | ", ("--5").is_valid_int(), " | ", ("+ 5").is_valid_int(), " | ", ("00").is_valid_int(), " | ", ("1 .5").is_valid_int(), " | ", ("x-5").is_valid_int())
	print("n23 ", int("a-5"), " | ", int("9223372036854775808"), " | ", int("1.9"), " | ", int("ffffffffffffffff"), " | ", int("--1.9"), " | ", int("9500000000000000009"))
	print("n24 ", sn.hex_to_int(), " | ", sn2.to_int(), " | ", sn2.is_valid_int(), " | ", sn3.is_valid_hex_number(true), " | ", sn2.is_valid_hex_number())
	quit()
