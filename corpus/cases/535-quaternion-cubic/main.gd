extends SceneTree
func _initialize():
	var q := Quaternion(0.1, 0.2, 0.3, 0.9)
	print("e|", q.exp())
	var r := Quaternion(0, 0.5, 0, 0.5)
	print("l|", r.log())
	quit()
