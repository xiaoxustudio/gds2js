extends SceneTree

func _initialize():
	var p = PackedByteArray([9, 8, 7])
	print("r1 ", p[1.5])
	p[1.5] = 5
	print("r2 ", p)
	p.set(1.5, 6)
	print("r3 ", p)
	p.insert(0.9, 4)
	print("r4 ", p)
	p.remove_at(2.7)
	print("r5 ", p)
	print("r6 ", p.find(6), " ", p.rfind(6))
	quit()
