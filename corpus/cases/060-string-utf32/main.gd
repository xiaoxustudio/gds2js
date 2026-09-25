extends SceneTree

func _initialize():
	var e = "ab😀cd"
	print(e.length())
	print(e[2])
	print(e.substr(1, 3))
	print("😀😀".length())
	var j = "你好世界"
	print(j.length())
	print(j[1])
	print(j.substr(1, 2))
	print(e + j)
	var c = "café"
	print(c.length())
	print(c.substr(2, 2))
	print("É".to_lower())
	print("ß".to_upper())
	print("À".to_lower())
	print("ﬁ".to_upper())
	print("ǳ".to_upper())
	print("ǅ".to_upper())
	print("ı".to_upper())
	print("Σ".to_lower())
	print("%s|%s" % [e[2], j[0]])
	quit()
