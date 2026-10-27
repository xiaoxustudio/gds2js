extends SceneTree

func _initialize():
	var i := Quaternion()
	var a := Quaternion(0.1, 0.2, 0.3, 0.9)
	var b := Quaternion(0, 0.7071068, 0, 0.7071068)
	var u := Quaternion(0, 1, 0, 0)
	print("w01|", str(a * b), "|", str(b * a))
	print("w02|", str(i * a), "|", str(a * i), "|", str(b * b))
	print("w03|", str(u * u), "|", str(a * u), "|", str(u * a))
	var va: Variant = a
	var vb: Variant = b
	print("w04|", str(va * vb), "|", str(vb * va), "|", str((a * b) * (b * a)))
	print("w05|", str(a * b * i), "|", str(b * Quaternion(0.1, 0.2, 0.3, 0.9)))
	quit()
