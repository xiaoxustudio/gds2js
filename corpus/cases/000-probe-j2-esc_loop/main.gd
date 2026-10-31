extends SceneTree

func _initialize():
	var out := ""
	for i in range(32):
		out += JSON.stringify(String.chr(i)) + ";"
	print("a|", out)
	quit()
