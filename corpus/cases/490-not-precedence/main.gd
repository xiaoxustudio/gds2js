extends SceneTree


func _initialize():
	print("a|", not 1 == 2, "|", not 1 == 1)
	print("c|", not 1 < 2, "|", not 1 > 2)
	print("d|", not true and false, "|", not false and true)
	print("e|", not 1 in [2, 3], "|", not 1 in [1, 2])
	print("f|", not (1 == 1), "|", not not true)
	var x = 3
	print("g|", not x == 3 or x == 4, "|", not x != 3)
	print("h|", not -1 == -1, "|", not 1 + 1 == 2)
	quit()
