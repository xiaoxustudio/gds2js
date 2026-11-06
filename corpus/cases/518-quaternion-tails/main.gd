extends SceneTree
func _initialize():
	var q := Quaternion(0.1, 0.2, 0.3, 0.9).normalized()
	print("n|", q.is_normalized(), "|", q.is_finite(), "|", Quaternion(1, 2, 3, 4).is_normalized())
	quit()
