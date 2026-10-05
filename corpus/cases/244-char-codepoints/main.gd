extends SceneTree

func _initialize():
	print("c01|", char(65), "|", char(97), "|", char(233), "|", char(0x4e2d))
	print("c02|", char(65).length(), "|", char(233).length(), "|", char(0x10ffff).length())
	print("c03|", char(1).unicode_at(0), "|", char(65).unicode_at(0), "|", char(0x10ffff).unicode_at(0))
	print("c04|", char(127).unicode_at(0), "|", char(128).unicode_at(0), "|", char(0x20).unicode_at(0))
	print("c05|", char(1.5).unicode_at(0), "|", char(2.9).unicode_at(0), "|", char(0x10ffff).unicode_at(0))
	print("c06|", char(65) == "A", "|", char(97) == "a", "|", char(233) == "é")
	print("c07|", typeof(char(65)), "|", String.chr(65) == char(65), "|", char(65) == char(97))
	print("c08|", char(65) + "/" + char(97), "|", ("x" + char(0x10ffff)).length())
	print("c09|", char(65).to_utf8_buffer(), "|", char(233).to_utf8_buffer(), "|", char(0x10ffff).to_utf8_buffer().size())
	print("c10|", char(10).c_escape(), "|", char(65).c_escape(), "|", char(92).c_escape())
	print("c11|", [char(65), char(97)], "|", {char(65): 1}.has("A"), "|", var_to_str(char(97)))
	print("c12|", char(65).to_upper(), "|", char(97).repeat(2), "|", char(50).to_int())
	quit()
