extends SceneTree

func _initialize():
	var a = "😀"
	var b = "￿"
	print(a.length())
	print(b.length())
	print(a < b)
	print(b < a)
	print(a > b)
	print("z" < a)
	print("z" < b)
	var arr = [a, b, "z", "apple"]
	arr.sort()
	print(arr[0])
	print(arr[1])
	print(arr[2])
	print(arr[3])
	print(a == b)
	quit()
