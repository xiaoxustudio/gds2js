extends SceneTree

func _initialize():
	for m in ["get_length", "get_real", "get_bool", "store_line", "get_csv_line", "get_pascal_string", "store_pascal_string", "resize", "set_position", "get_text_as_utf8_bytes", "open_encrypted_with_pass", "get_md5", "flush_commit", "type_id", "exists", "copy", "move", "read", "write", "get_modified_time", "was_readable", "set_line_delimiter", "get_line_delimiter", "get_feature", "has_feature", "get_uuid", "get_space"]:
		print("m|", m)
	quit()
