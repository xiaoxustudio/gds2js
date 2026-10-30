extends SceneTree

const T = preload("res://tokens.gd")
const S = preload("res://scan.gd")


func _initialize():
	print("a|", T.TAB_WIDTH, "|", T.PUNCT.size(), "|", T.PUNCT[0], "|", T.PUNCT[47])
	print("b|", T.punct_face("2 **= 3 := x"))
	print("c|", S.split("12 + 345 ** x"))
	print("d|", T.new() != null, "|", T.punct_at("**=", 0), "|", T.punct_at("**=", 3))
	print("e|", S.split(""), "|", T.PUNCT)
	quit()
