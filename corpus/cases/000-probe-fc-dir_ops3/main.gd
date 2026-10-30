extends SceneTree

func _initialize():
	var d := DirAccess.open("user://")
	print("a|", d.make_dir("sub"), "|", d.copy("seed.txt", "sub/s2.txt"), "|", d.rename("sub/s2.txt", "sub/s3.txt"))
	print("b|", d.get_files(), "|", d.get_directories())
	print("c|", d.remove("sub/s3.txt"), "|", d.remove("sub/nope.txt"), "|", d.remove("sub"))
	print("d|", DirAccess.remove_absolute("user://sub"), "|", d.get_files())
	quit()
