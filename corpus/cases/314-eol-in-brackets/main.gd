extends SceneTree

func _initialize():
	var a = [1 +
		2,
		3]
	print("A|", a)
	var d = {
		"x":
			1,
		"y": 3
	}
	print("D|", d)
	print("C|", str(
		1,
		2
	))
	var p = (1 +
		2) * (3 +
		4)
	print("P|", p)
	var s = [7, 8, 9]
	print("S|", s[
		2 -
		1
	])
	var b = true
	if (
		b and
		true
	):
		print("I|", 1)
	var n = 0
	while (
		n <
		2
	):
		n += 1
	print("W|", n)
	for i in [
		10,
		20
	]:
		print("F|", i)
	var m = 8
	m += (
		2)
	print("MA|", m)
	match (
		1):
		1:
			print("M1|", 1)
	match 1:
		1 when (
			true
		):
			print("M2|", 2)
		_:
			print("M3|", 3)
	for i in (
		5
	):
		print("FI|", i)
	match [1]:
		[1]
		:
			print("AA|", 1)
	quit()
