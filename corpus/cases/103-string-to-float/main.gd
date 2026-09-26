extends SceneTree

func _initialize():
	print("g1 ", int(("9007199254740993.0").to_float()), " | ", int(float("9007199254740993.0")))
	print("g2 ", int(("0.0000001234567890123456789").to_float() * 1e25), " | ", int(("1.000000000000000083266726846886739642044414197265625").to_float() * 1e18))
	print("g3 ", ("1_000_000.25").to_float(), " | ", ("1_000_000.25").is_valid_float())
	print("g4 ", (" 1.5 ").to_float(), " | ", (" 1.5 ").is_valid_float(), " | ", ("1e5 ").is_valid_float(), " | ", ("1e5 ").to_float())
	print("g5 ", (".5").is_valid_float(), " | ", ("5.").is_valid_float(), " | ", ("1e").is_valid_float(), " | ", ("1e+").is_valid_float(), " | ", ("1e-2").is_valid_float())
	print("g6 ", ("+-1").is_valid_float(), " | ", ("0x10").is_valid_float(), " | ", ("1.5abc").is_valid_float(), " | ", (".e5").is_valid_float(), " | ", ("inf").is_valid_float())
	print("g7 ", ("1.2.3.4").is_valid_float(), " | ", ("1.2.3.4").to_float(), " | ", ("01.50").is_valid_float(), " | ", ("1 E5").is_valid_float())
	print("g8 ", ("  -2.5x").to_float(), " | ", ("-.5").to_float(), " | ", ("+5.5").to_float(), " | ", ("abc").to_float(), " | ", ("").to_float())
	print("g9 ", ("").is_valid_float(), " | ", (".").is_valid_float(), " | ", ("0.999999999999999999999").is_valid_float(), " | ", int(("0.999999999999999999999").to_float()))
	print("g10 ", ("nan").to_float(), " | ", ("inf").to_float(), " | ", ("1 2").to_float(), " | ", int(float("0.0000001234567890123456789") * 1e25))
	quit()
