extends SceneTree

func hit(s: Variant) -> String:
	match s:
		1 + 1:
			return "A-sum"
		3 - 2:
			return "A-sub"
		4 / 2:
			return "A-div"
		7 % 3:
			return "A-mod"
		2 ** 1:
			return "A-pow"
		1.5 + 1:
			return "A-float"
		not true:
			return "A-not"
		true and false:
			return "A-and"
		true or false:
			return "A-or"
		"a" + "b":
			return "A-str"
		-1:
			return "A-neg"
		(1 + 1) * 2:
			return "A-paren"
		_:
			return "A-none"

var z = 1

func _initialize():
	print("V01|", hit(2))
	print("V02|", hit(1))
	print("V03|", hit(2.5))
	print("V04|", hit(false))
	print("V05|", hit(true))
	print("V06|", hit("ab"))
	print("V07|", hit(-1))
	print("V08|", hit(4))
	print("V09|", hit(3))
	print("V10|", hit(0))
	print("V11|", hit("xy"))
	quit()
