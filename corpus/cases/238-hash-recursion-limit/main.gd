extends SceneTree

func _initialize():
	var a = []
	for i in 10:
		a = [a]
	print("d10|", a.hash())
	var b = []
	for i in 100:
		b = [b]
	print("d100|", b.hash())
	var c = []
	for i in 101:
		c = [c]
	print("d101|", c.hash())
	var dd = {}
	for i in 101:
		dd = {"k": dd}
	print("dict101|", dd.hash())
	var e = []
	for i in 120:
		e = [e]
	print("d120|", e.hash())
	var f = []
	for i in 300:
		f = [{"k": [f]}]
	print("d300mix|", f.hash())
	print("flat|", [1, 2].hash())
	quit()
