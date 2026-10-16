extends SceneTree

func _initialize():
	print("P1|", NodePath("a/b").get_concatenated_names())
	print("P2|", NodePath("a/b:cmp").get_concatenated_names(), " ", NodePath("a/b:cmp").get_concatenated_subnames())
	print("P3|", NodePath(":a/b").get_concatenated_names(), "|", NodePath(":a/b").get_concatenated_subnames())
	print("P4|", NodePath("a/b:one/two").get_concatenated_subnames())
	print("P5|", NodePath("a/../b").get_concatenated_names())
	print("P6|", typeof(NodePath("a/b").get_concatenated_names()), " ", NodePath("a/b/c").get_concatenated_names())
	quit()
