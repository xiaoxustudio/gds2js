extends SceneTree

func sv(raw: String) -> Variant:
	return str_to_var("\"" + raw + "\"")

func _initialize():
	print("w01|", typeof(sv("\\U000041")), "|", sv("\\U000041"))
	var v2 = sv("\\U0001F600")
	print("w02|", typeof(v2), "|", v2, "|", v2.length(), "|", v2.unicode_at(0))
	var v3 = sv("\\U10FFFF")
	print("w03|", typeof(v3), "|", v3.length(), "|", v3.unicode_at(0), "|", v3.to_utf8_buffer().hex_encode())
	print("w04|", typeof(sv("\\U0041")), "|", sv("\\U0041"))
	print("w05|", typeof(sv("\\U00D800")), "|", sv("\\U00D800"))
	print("w06|", typeof(sv("\\U00DFFF00")), "|", sv("\\U00DFFF00"))
	print("w07|", typeof(sv("\\U0001F")), "|", sv("\\U0001F"))
	print("w08|", typeof(sv("\\U0000G1")), "|", sv("\\U0000G1"))
	var v9 = sv("a\\U0000e9b")
	print("w09|", typeof(v9), "|", v9, "|", v9.length())
	print("w10|", sv("\\u0041\\U000042"))
	print("w11|", str_to_var("[\"\\U000041\", \"\\U000042\"]"))
	print("w12|", typeof(sv("\\U")), "|", sv("\\U"))
	quit()
