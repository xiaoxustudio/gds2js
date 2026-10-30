extends SceneTree

func _initialize():
	var t := Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3(1, 2, 3))
	var d := {t: 1}
	print("a|", hash(t), "|", d.has(Transform3D(Basis(Vector3(2, 0, 0), Vector3(0, 3, 0), Vector3(0, 0, 4)), Vector3(1, 2, 3))), "|", t is Transform3D, "|", typeof(t))
	quit()
