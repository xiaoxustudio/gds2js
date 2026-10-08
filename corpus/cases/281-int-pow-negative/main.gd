extends SceneTree

func show(tag, v):
	print(tag, "|", typeof(v), "|", var_to_str(v))

func _initialize():
	show("q01|", 2 ** -1)
	show("q02|", 2 ** -3)
	show("q03|", 4 ** -1)
	show("q04|", 3 ** -2)
	show("q05|", (-2) ** -3)
	show("q06|", (-1) ** -101)
	show("q07|", 1 ** -100)
	show("q08|", 10 ** -3)
	var u0 = 2
	var v0 = -3
	show("q09|", u0 ** v0)
	var u1 = -2
	var v1 = -3
	show("q10|", u1 ** v1)
	var u2 = -1
	var v2 = -3
	show("q11|", u2 ** v2)
	var u3 = 1
	var v3 = -1
	show("q12|", u3 ** v3)
	var u4 = 0
	var v4 = -1
	show("q13|", u4 ** v4)
	var u5 = 0
	var v5 = 0
	show("q14|", u5 ** v5)
	var t0: int = 2
	var k0: int = -3
	var z0: int = t0 ** k0
	show("q15|", z0)
	var t1: int = -2
	var k1: int = -3
	var z1: int = t1 ** k1
	show("q16|", z1)
	var t2: int = 0
	var k2: int = -1
	var z2: int = t2 ** k2
	show("q17|", z2)
	var t3: int = 1
	var k3: int = -1
	var z3: int = t3 ** k3
	show("q18|", z3)
	var t4: int = 10
	var k4: int = -3
	var z4: int = t4 ** k4
	show("q19|", z4 + 0)
	var t5: int = -1
	var k5: int = -101
	var z5: int = t5 ** k5
	show("q20|", z5 - z5 == 0)
	show("q21|", pow(2, -3))
	show("q22|", pow(2.0, -3))
	show("q23|", 2 ** -3 * 8)
	quit()
