extends SceneTree

func _initialize():
	var d: Dictionary = {1: 2}
	print(d.set(0))
	print(d.set(0, 1, 2))
	var s: String = "a.txt"
	print(s.uri_file_decode(1))
	print(s.is_valid_ascii_identifier(1))
	print(s.is_valid_unicode_identifier(1))
	quit()
