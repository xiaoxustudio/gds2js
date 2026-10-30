extends SceneTree

func _initialize():
	print("a|", typeof(DirAccess.open("res://")), "|", DirAccess.open("res://") != null)
	var d := DirAccess.open("user://")
	print("b|", d.get_current_dir())
	print("c|", DirAccess.globalize_path("user://a.txt"), "|", DirAccess.local_to_global("./x"))
	quit()
