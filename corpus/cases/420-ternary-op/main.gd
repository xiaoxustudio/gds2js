extends SceneTree

var log := []

func side(x):
	log.append(x)
	return x

func _initialize():
	print(1 if true else 2)
	print(1 if true else 2 if true else 3)
	print(-1 if true else 2)
	print(1 + (1 if true else 2))
	var pz = 0.0
	var nz = pz * -1.0
	print(nz if true else 1)
	print(9007199254740993 if true else 1)
	print(side(1) if true else side(2))
	print(log)
	print("big" if 5 > 3 else "small")
	var d = {1: 2}
	print(d if true else 9)
	print((d if true else 9)[1])
	var v: int = 1 if true else 2.5
	print(v)
	print(null if true else 1)
	quit()
