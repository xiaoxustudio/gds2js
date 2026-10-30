extends SceneTree

func _initialize():
	print("a|", JSON.stringify(String.chr(127)), "|", JSON.stringify(String.chr(0x2028)), "|", JSON.stringify(String.chr(0x2029)), "|", JSON.stringify(String.chr(0xfeff)))
	print("b|", JSON.stringify("\u007f"), "|", JSON.stringify("<>"), "|", JSON.stringify("&"))
	quit()
