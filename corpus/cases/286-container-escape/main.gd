extends SceneTree

func _initialize():
	var cs = [34, 92, 39, 10, 9, 13, 7, 11, 12, 27, 96, 32, 47, 233, 128512]
	for c in cs:
		var s = "a" + char(c) + "b"
		print(c, "|", [s], "|", {s: 1}, "|", var_to_str(s), "|", str(s), "|", [StringName(s)], "|", [NodePath(s)], "|", var_to_str([s]), "|", str([s]), "|", [s, StringName(s)])
	quit()
