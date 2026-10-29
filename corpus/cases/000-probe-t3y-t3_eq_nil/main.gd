extends SceneTree

func _initialize():
	var t := Transform3D()
	print("a|", t == null, "|", t != null, "|", null == t)
	quit()
