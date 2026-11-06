extends SceneTree
func _initialize():
	var i := Quaternion(0, 0, 0, 1)
	var y90 := Quaternion(Vector3(0, 1, 0), PI / 2)
	print("ang|", i.angle_to(y90), "|", y90.angle_to(i), "|", i.angle_to(i))
	print("eul|", y90.get_euler(), "|", Quaternion(0.1, 0.2, 0.3, 0.9).normalized().get_euler())
	print("sl|", i.slerp(y90, 0.5))
	print("sn|", i.slerpni(y90, 0.5))
	quit()
