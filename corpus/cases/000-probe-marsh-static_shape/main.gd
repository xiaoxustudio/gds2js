extends SceneTree

func _initialize():
	var m := Marshalls.new()
	print("a|", str(m), "|", typeof(m), "|", m is Object, "|", m.get_class())
	quit()
