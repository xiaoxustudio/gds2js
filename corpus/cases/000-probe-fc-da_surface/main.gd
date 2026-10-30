extends SceneTree

func _initialize():
	var lm := DirAccess.open("user://").get_method_list()
	var names := []
	for e in lm:
		names.append(e["name"])
	names.sort()
	print("methods|DirAccess|", ";".join(names))
	print("enums|DirAccess|", ";".join(ClassDB.class_get_enum_constants("DirAccess", "AccessFlags")))
	print("e|", DirAccess.open("user://") != null)
	quit()
