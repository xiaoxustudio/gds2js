extends SceneTree

func _initialize():
	for m in ["open", "get_open_err", "make_dir_absolute", "make_dir_recursive_absolute", "remove_absolute", "copy_absolute", "rename_absolute", "dir_exists_absolute", "file_exists_absolute", "exists", "get_files_at_absolute", "get_directories_at_absolute", "is_read_only_absolute", "change_dir_to_beginning"]:
		print("m|", m, "|", ClassDB.class_has_method("DirAccess", m, false))
	quit()
