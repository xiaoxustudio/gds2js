extends SceneTree

func _initialize():
	var lm := FileAccess.new().get_method_list()
	var names := []
	for e in lm:
		names.append(e["name"])
	names.sort()
	print("methods|FileAccess|", ";".join(names))
	print("enums|FileAccess|", ";".join(ClassDB.class_get_enum_constants("FileAccess", "ModeFlags")))
	print("e|", FileAccess.READ, "|", FileAccess.WRITE, "|", FileAccess.READ_WRITE, "|", FileAccess.WRITE_READ)
	quit()
