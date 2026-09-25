extends SceneTree

func _initialize():
	var s = "a"
	var i = 0
	while i < 3:
		s = s + "b"
		i += 1
	print(s)
	var empty = ""
	print(empty == "")
	if s:
		print("truthy")
	if empty:
		print("nope")
	else:
		print("empty-false")
	print(s + "!")
	print(str(1) + "x")
	quit()
