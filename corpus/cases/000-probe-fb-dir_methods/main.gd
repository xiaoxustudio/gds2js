extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	for m in ["get_files", "get_directories", "get_next", "get_current_dir", "is_read_only", "get_size", "get_access", "change_dir", "make_dir", "remove", "rename", "copy", "file_exists", "dir_exists", "exists", "get_open_error", "make_dir_recursive", "remove_absolute", "list_dir_begin", "list_dir_end"]:
		print("m|", m, "|", d.has_method(m))
	quit()
