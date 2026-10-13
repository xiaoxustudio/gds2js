extends SceneTree

# 实测：SceneTree + Object 的 97 个方法名都能裸当值用，给 typeof 25 的 Callable（S366）；这一例钉其中此前被解析期拦掉的那一批。
func _initialize():
	var names = ["call_group", "call_group_flags", "change_scene_to_file", "change_scene_to_node", "create_tween", "get_current_scene", "get_frame", "get_multiplayer", "get_nodes_in_group", "has_group", "is_paused", "notify_group", "reload_current_scene", "set_pause", "unload_current_scene", "get_root", "get_edited_scene_root", "callv", "can_translate_messages", "cancel_free", "get_instance_id", "get_method_list", "get_property_list", "get_script", "has_meta", "has_signal", "is_class", "notify_property_list_changed", "queue_delete", "set_block_signals", "set_deferred", "set_script", "to_string", "tr", "tr_n"]
	var fns = [call_group, call_group_flags, change_scene_to_file, change_scene_to_node, create_tween, get_current_scene, get_frame, get_multiplayer, get_nodes_in_group, has_group, is_paused, notify_group, reload_current_scene, set_pause, unload_current_scene, get_root, get_edited_scene_root, callv, can_translate_messages, cancel_free, get_instance_id, get_method_list, get_property_list, get_script, has_meta, has_signal, is_class, notify_property_list_changed, queue_delete, set_block_signals, set_deferred, set_script, to_string, tr, tr_n]
	for i in fns.size():
		var f: Variant = fns[i]
		print(names[i], " → typeof ", typeof(f), " | ", f.get_method(), " | 有效 ", f.is_valid(), " | 空 ", f.is_null())
	var packed = [get_frame, is_paused, tr]
	print("装进数组 → ", packed.size(), " | ", packed[0].get_method(), " | ", packed[2].get_method())
	quit()
