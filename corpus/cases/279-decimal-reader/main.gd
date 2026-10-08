extends SceneTree

func show(tag, v):
	print(tag, "|", typeof(v), "|", var_to_str(v))

func _initialize():
	show("r01|", float("1e-30"))
	show("r02|", float("1.0e-30"))
	show("r03|", float("3e-30"))
	show("r04|", float("3.0e-30"))
	show("r05|", float("12abc"))
	show("r06|", float("xyz"))
	show("r07|", float("1.5e+"))
	show("r08|", float("1e-309"))
	show("r09|", float("9007199254740993.0"))
	show("r10|", float("12345678901234567890.5"))
	show("r11|", float("1e23"))
	show("r12|", float("2.5e-11"))
	show("r13|", str_to_var("1e-30"))
	show("r14|", str_to_var("0.0000001234567890123456789"))
	show("r15|", str_to_var("99.99999999999999999999"))
	show("r16|", 1e-30)
	show("r17|", 2.5e-11)
	show("r18|", 1024e23)
	show("r19|", 1.7976931348623157e308)
	show("r20|", 0.0000001234567890123456789)
	quit()
