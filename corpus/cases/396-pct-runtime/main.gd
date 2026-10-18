extends SceneTree

var sFmt: String = "%d"
var sPlain: String = "ab"
var sTwo: String = "%s%s"
var sStar: String = "%*d"
var nFmt: StringName = &"%d"
var nPlain: StringName = &"ab"
var nTwo: StringName = &"%s%s"
var nX: StringName = &"%x"
var nC: StringName = &"%c"
var nV: StringName = &"%v"
var nF: StringName = &"%5.2f"
var nStar: StringName = &"%*d"
var aStr: String = "ab"
var one: String = "a"
var no: int = 7
var negi: int = -1
var fl: float = 1.5
var vv: Vector2 = Vector2(1, 2)
var va1: Array = [1]
var va2: Array = [1, 2]
var vs2: Array = ["a", "b"]

func _initialize():
	print(nFmt % no)
	print(nFmt % fl)
	print(nFmt % negi)
	print(nX % 255)
	print(nC % no)
	print(nC % one)
	print(nV % vv)
	print(nF % 1.234)
	print(nFmt % va1)
	print(nPlain % no)
	print(nPlain % aStr)
	print(nFmt % aStr)
	print(nTwo % aStr)
	print(nFmt % va2)
	print(nStar % aStr)
	print(nStar % no)
	print(nStar % va2)
	print(sFmt % aStr)
	print(sPlain % no)
	print(sTwo % aStr)
	print(sStar % aStr)
	print(sFmt % va2)
	print("%d/%s" % [4, "x"])
	print(typeof(nFmt % no))
	print(typeof(sFmt % no))
	print(nFmt % no == "7")
	print(nPlain % no == "ab")
	print(nFmt % &"ab")
	print(nV % no)
	print(nStar % vv)
	quit()
